import { Request, Response, NextFunction, Router } from "express";
import { User, Plan, UserSubscription, sequelize } from "../db";
import { Op, Transaction } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import crypto from "crypto";
import stripe from "../lib/stripe";
import { HttpError } from "http-errors-enhanced";

const authRouter = Router();

const requiredEnvVars = [
  "JWT_SECRET",
  "JWT_EXPIRATION",
  "RESEND_API_KEY",
  "FRONTEND_URL",
  "EMAIL_FROM_NAME",
  "EMAIL_FROM_ADDRESS",
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
}

authRouter.post(
  "/login",
  async (
    req: Request<{}, LoginSuccessResBody, LoginBody, LoginQuery>,
    res: Response<LoginSuccessResBody>,
    next: NextFunction
  ) => {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new HttpError(400, "Username and password are required", {
        errors: {
          credentials: { message: "Username and password are required" },
        },
      });
    }

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

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.getDataValue("id"),
          fullname: user.getDataValue("fullname"),
          username: user.getDataValue("username"),
          email: user.getDataValue("email"),
        },
        token: token,
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
  (req: Request, res: Response<LogoutResBody>) => {
    // Here you would typically destroy the session or invalidate the JWT token
    // For this example, we'll just return a success message
    res.send({ message: "Logged out successfully" });
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

authRouter.post(
  "/register",
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

authRouter.post(
  "/forgot-password",
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

      // Generate a password reset token
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // Token expires in 1 hour

      // Update user with reset token and expiry
      await user.update({
        resetToken,
        resetTokenExpiry,
      });

      // Send password reset email using Resend
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

authRouter.post(
  "/reset-password",
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

      res.status(200).json({
        message: "Password has been reset successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default authRouter;