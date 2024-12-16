import { Request, Response, NextFunction, Router } from "express";
import { User, Plan, UserSubscription, sequelize, UserActivity } from "../db";
import { Op, Transaction } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import crypto from "crypto";
import stripe from "../lib/stripe";
import { HttpError } from "http-errors-enhanced";
import Joi from "joi";
import { validateRequest } from "&/middlewares/validateRequest";
import validateSessionToken, { RequestWithUser } from "&/middlewares/validateSessionToken";
import logger from "&/lib/logger";
import { getRedisInstance } from "&/redis";
import { getClientMetadata } from "&/lib/utils";

const authRouter = Router();

const requiredEnvVars = [
  "JWT_SECRET",
  "JWT_EXPIRATION",
  "RESEND_API_KEY",
  "FRONTEND_URL",
  "EMAIL_FROM_NAME",
  "EMAIL_FROM_ADDRESS",
  "REFRESH_TOKEN_TTL",
];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET ?? "";
const JWT_EXPIRATION = process.env.JWT_EXPIRATION;
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL;
const resend = new Resend(process.env.RESEND_API_KEY);

interface ErrorsMap {
  [key: string]: { message: string };
}

interface LoginQuery {
  redirect?: string;
}

interface LoginBody {
  username: string;
  password: string;
}

interface UserData {
  id: number;
  fullname: string;
  username: string;
  email: string;
}

interface LoginSuccessResBody {
  message: string;
  user: UserData;
  token: string;
  refreshToken: string;
}

const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': 'Username is required',
    'any.required': 'Username is required'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  })
});

authRouter.post(
  "/login",
  validateRequest(loginSchema),
  async (
    req: Request<{}, LoginSuccessResBody, LoginBody, LoginQuery>,
    res: Response<LoginSuccessResBody>,
    next: NextFunction
  ) => {
    const { username, password } = req.body;

    try {
      const user = await User.scope('withPassword').findOne({
        where: {
          [Op.or]: [{ username }, { email: username }],
        },
      });

      if (!user) {
        throw new HttpError(400, "Invalid username or password", {
          errors: { credentials: { message: "Invalid username or password" } },
        });
      }

      const hashedPassword = user.getDataValue("password");
      const isPasswordValid = await bcrypt.compare(password, hashedPassword);

      if (!isPasswordValid) {
        throw new HttpError(400, "Invalid username or password", {
          errors: { credentials: { message: "Invalid username or password" } },
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.getDataValue("id"),
          username: user.getDataValue("username"),
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );

      const redisCli = await getRedisInstance()
        .catch((error) => {
          logger.error("Failed to get Redis client", { error: error.message });
          throw new HttpError(500, "Failed to register user");
        });
      await redisCli.set(`user:${user.getDataValue("id")}:token`, token);
      const refreshToken = jwt.sign(
        {
          userId: user.getDataValue("id"),
          username: user.getDataValue("username"),
        },
        JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_TTL }
      );
      await redisCli.set(`user:${user.getDataValue("id")}:refreshToken`, refreshToken);

      UserActivity.create({
        userId: user.getDataValue("id"),
        activityType: "login",
        description: "User logged in",
        metadata: getClientMetadata(req),
      });

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.getDataValue("id"),
          fullname: user.getDataValue("fullname"),
          username: user.getDataValue("username"),
          email: user.getDataValue("email"),
        },
        token: token,
        refreshToken: refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }
);

interface RefreshTokenQuery {
  redirect?: string;
}

interface RefreshTokenSuccessResBody {
  message: string;
  token: string;
}

authRouter.get(
  "/refresh-token",
  async (
    req: Request<{}, {}, {}, RefreshTokenQuery>,
    res: Response<RefreshTokenSuccessResBody>,
    next: NextFunction
  ) => {
    const refreshToken = req.headers.authorization?.split(" ")[1];

    if (!refreshToken) {
      throw new HttpError(401, "No refresh token provided");
    }

    try {
      const payload = jwt.decode(refreshToken);
      if (!payload || typeof payload === "string") {
        throw new HttpError(401, "Invalid refresh token");
      }

      const { userId, username } = payload as { userId: number; username: string };

      const redisCli = await getRedisInstance()
        .catch((error) => {
          logger.error("Failed to get Redis client", { error: error.message });
          throw new HttpError(500, "Failed to register user");
        });
      const validate = await redisCli.get(`user:${userId}:refreshToken`);

      if (validate !== refreshToken) {
        throw new HttpError(401, "Invalid refresh token");
      }

      const token = jwt.sign(
        { userId, username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );

      await redisCli.set(`user:${userId}:token`, token);

      const redirect = req.query.redirect;
      if (redirect) {
        res.redirect(redirect);
        return;
      }

      res.status(200).json({
        message: "Token refreshed successfully",
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

interface LogoutResBody {
  message: string;
}

authRouter.get(
  "/logout",
  async (req: RequestWithUser, res: Response<LogoutResBody>, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        next(new HttpError(401, "Unauthorized"));
        return;
      }

      const redisCli = await getRedisInstance()
        .catch((error) => {
          logger.error("Failed to get Redis client", { error: error.message });
          throw new HttpError(500, "Failed to register user");
        });
      redisCli.del(`user:${userId}:token`);

      UserActivity.create({
        userId,
        activityType: "logout",
        description: "User logged out",
        metadata: getClientMetadata(req),
      });

      res.send({ message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  }
);

interface RegisterBody {
  fullname: string;
  username: string;
  email: string;
  password: string;
}

interface RegisterSuccessResBody {
  message: string;
  userId: number;
}

const registerSchema = Joi.object({
  fullname: Joi.string().required().messages({
    'string.empty': 'Full name is required',
    'any.required': 'Full name is required'
  }),
  username: Joi.string().required().messages({
    'string.empty': 'Username is required',
    'any.required': 'Username is required'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required'
  })
});

authRouter.post(
  "/register",
  validateRequest(registerSchema),
  async (
    req: Request<{}, RegisterSuccessResBody, RegisterBody>,
    res: Response<RegisterSuccessResBody>,
    next: NextFunction
  ) => {
    const { fullname, username, email, password } = req.body;

    let transaction: Transaction | null = null;

    try {
      transaction = await sequelize.transaction();
      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }],
        },
      });

      if (existingUser) {
        await transaction.rollback();
        const errors: ErrorsMap = {};
        if (existingUser.getDataValue("username") === username) {
          errors.username = { message: "Username already exists" };
        }
        if (existingUser.getDataValue("email") === email) {
          errors.email = { message: "Email already exists" };
        }
        throw new HttpError(400, "User already exists", { errors });
      }

      // Create Stripe customer
      const stripeCustomer = await stripe.customers.create({ email, name: fullname });

      // Create new user
      const newUser = await User.create(
        {
          fullname,
          username,
          email,
          password,
          stripeCustomerId: stripeCustomer.id,
          isActive: true,
        },
        { transaction }
      );

      // Find the free plan
      const freePlan = await Plan.findOne({
        where: { code: "FREE" },
      });

      if (!freePlan) {
        await transaction.rollback();
        throw new HttpError(500, "Free plan not found");
      }

      // Create Stripe subscription for the free plan
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomer.id,
        items: [{ price: freePlan.getDataValue("stripePriceId") }],
      });

      // Assign the free plan to the user
      await UserSubscription.create(
        {
          userId: newUser.getDataValue("id"),
          stripePriceId: freePlan.getDataValue("stripePriceId"),
          status: "active",
          activatedAt: new Date(),
          stripeSubscriptionId: subscription.id,
          stripeSubscriptionItemId: subscription.items.data[0].id,
        },
        { transaction }
      );

      await transaction.commit();

      UserActivity.create({
        userId: newUser.getDataValue("id"),
        activityType: "register",
        description: "User registered",
        metadata: getClientMetadata(req),
      });

      res.status(201).json({
        message: "User registered successfully and assigned free plan",
        userId: newUser.getDataValue("id"),
      });
    } catch (error) {
      if (transaction) await transaction.rollback();
      next(error);
    }
  }
);

interface ForgotPasswordBody {
  email: string;
}

interface ForgotPasswordSuccessResBody {
  message: string;
}

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required'
  })
});

authRouter.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  async (
    req: Request<{}, ForgotPasswordSuccessResBody, ForgotPasswordBody>,
    res: Response<ForgotPasswordSuccessResBody>,
    next: NextFunction
  ) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw new HttpError(404, "No user found with this email address", {
          errors: {
            email: { message: "No user found with this email address" },
          },
        });
      }

      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000);

      await user.update({
        resetToken,
        resetTokenExpiry,
      });

      const { error } = await resend.emails.send({
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: user.getDataValue("email"),
        subject: "Password Reset Request",
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Request</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; border-radius: 5px;">
              <tr>
                <td style="padding: 20px;">
                  <h1 style="color: #4a4a4a; text-align: center; margin-bottom: 30px;">Password Reset Request</h1>
                  <p style="margin-bottom: 20px;">Hello,</p>
                  <p style="margin-bottom: 20px;">We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
                  <p style="margin-bottom: 30px;">To reset your password, click the button below:</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}" style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold;">Reset Password</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin-top: 30px;">If the button doesn't work, you can also copy and paste the following link into your browser:</p>
                  <p style="word-break: break-all; color: #007bff;">${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}</p>
                  <p style="margin-top: 30px;">This link will expire in 1 hour for security reasons.</p>
                  <p style="margin-top: 30px;">If you didn't request a password reset, please ignore this email or contact support if you have any concerns.</p>
                  <p style="margin-top: 30px;">Best regards,<br>The ${process.env.EMAIL_FROM_NAME} Team</p>
                </td>
              </tr>
            </table>
            <p style="text-align: center; font-size: 12px; color: #888; margin-top: 20px;">This is an automated message, please do not reply to this email.</p>
          </body>
          </html>
        `,
      });

      if (error) {
        throw new HttpError(500, "Failed to send reset email");
      }

      UserActivity.create({
        userId: user.getDataValue("id"),
        activityType: "forgot-password",
        description: "User requested password reset",
        metadata: getClientMetadata(req),
      });

      res.status(200).json({
        message: "Password reset email sent",
      });
    } catch (error) {
      next(error);
    }
  }
);

interface ResetPasswordBody {
  token: string;
  newPassword: string;
}

interface ResetPasswordSuccessResBody {
  message: string;
}

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Reset token is required',
    'any.required': 'Reset token is required'
  }),
  newPassword: Joi.string().min(8).required().messages({
    'string.empty': 'New password is required',
    'string.min': 'New password must be at least 8 characters long',
    'any.required': 'New password is required'
  })
});

authRouter.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  async (
    req: Request<{}, ResetPasswordSuccessResBody, ResetPasswordBody>,
    res: Response<ResetPasswordSuccessResBody>,
    next: NextFunction
  ) => {
    const { token, newPassword } = req.body;
    try {
      const user = await User.findOne({
        where: {
          resetToken: token,
          resetTokenExpiry: { [Op.gt]: new Date() },
        },
      });

      if (!user) {
        throw new HttpError(400, "Invalid or expired reset token", {
          errors: { token: { message: "Invalid or expired reset token" } },
        });
      }

      // Update user's password and clear reset token fields
      await user.update({
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null,
      });

      UserActivity.create({
        userId: user.getDataValue("id"),
        activityType: "reset-password",
        description: "User reset password",
        metadata: getClientMetadata(req),
      });

      res.status(200).json({
        message: "Password has been reset successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

interface UpdatePasswordBody {
  oldPassword: string;
  password: string;
}

interface UpdatePasswordSuccessResBody {
  message: string;
}

const updatePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'string.empty': 'Old password is required',
    'any.required': 'Old password is required'
  }),
  password: Joi.string().min(8).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required'
  })
});

authRouter.patch("/update-password",
  validateSessionToken,
  validateRequest(updatePasswordSchema),
  async (req: RequestWithUser<{}, UpdatePasswordSuccessResBody, UpdatePasswordBody>, res: Response, next: NextFunction) => {
    const { password, oldPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new HttpError(401, "Unauthorized");
    }

    try {
      const user = await User.findByPk(userId)
        .catch((error) => {
          logger.error("Failed to update password", { error: error.message });
          throw new HttpError(400, "Failed to update password");
        });

      if (!user) {
        throw new HttpError(404, "User not found");
      }

      const hashedPassword = user.getDataValue("password");
      const isPasswordValid = await bcrypt.compare(oldPassword, hashedPassword);
      if (!isPasswordValid) {
        throw new HttpError(400, "Invalid old password");
      }

      await user.update({ password })
        .catch((error) => {
          logger.error("Failed to update password", { error: error.message });
          throw new HttpError(400, "Failed to update password");
        });

      UserActivity.create({
        userId: user.getDataValue("id"),
        activityType: "update-password",
        description: "User updated password",
        metadata: getClientMetadata(req),
      });

      res.status(200).json({
        message: "Password updated successfully",
      });
    } catch (error) {
      next(error);
    }
  })

export default authRouter;