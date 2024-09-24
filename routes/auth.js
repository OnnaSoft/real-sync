import express from "express";
import { User } from "../db.js"; // Assuming you've set up your models index file
import { Op } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import crypto from "crypto";

const router = express.Router();

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

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION;
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * @typedef {import('../types/http.d.ts').ErrorResBody} ErrorResBody
 * @typedef {import('../types/http.d.ts').ErrorsMap} ErrorsMap
 */

/**
 * @typedef {Object} LoginQuery
 * @property {string} [redirect] - Optional redirect URL after login
 */

/**
 * @typedef {Object} LoginBody
 * @property {string} username
 * @property {string} password
 */

/**
 * @typedef {Object} UserData
 * @property {number} id - ID of the user
 * @property {string} fullname - Full name of the user
 * @property {string} username - Username of the user
 * @property {string} email - Email of the user
 */

/**
 * @typedef {Object} LoginSuccessResBody
 * @property {string} message - Success message
 * @property {UserData} user - User data
 * @property {string} token - JWT token
 */

router.post(
  "/login",
  /**
   * POST /login
   * @param {express.Request<{}, LoginSuccessResBody | ErrorResBody, LoginBody, LoginQuery>} req
   * @param {express.Response<LoginSuccessResBody | ErrorResBody>} res
   */
  async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email: username }],
        },
      });

      if (!user) {
        return res.status(400).json({
          errors: { credentials: { message: "Invalid username or password" } },
        });
      }

      const hashedPassword = user.getDataValue("password");
      const isPasswordValid = await bcrypt.compare(password, hashedPassword);

      if (!isPasswordValid) {
        return res.status(400).json({
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
      console.error("Login error:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
    }
  }
);

/**
 * @typedef {Object} LogoutResBody
 * @property {string} message - Response message
 */

router.get(
  "/logout",
  /**
   * GET /logout
   * @param {express.Request} req
   * @param {express.Response<LogoutResBody>} res
   */
  (req, res) => {
    // Here you would typically destroy the session or invalidate the JWT token
    // For this example, we'll just return a success message
    res.send({ message: "Logged out successfully" });
  }
);

/**
 * @typedef {Object} RegisterBody
 * @property {string} fullname
 * @property {string} username
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} RegisterSuccessResBody
 * @property {string} message - Success message
 * @property {number} userId - ID of the newly registered user
 */

router.post(
  "/register",
  /**
   * POST /register
   * @param {express.Request<{}, RegisterSuccessResBody | ErrorResBody, RegisterBody>} req
   * @param {express.Response<RegisterSuccessResBody | ErrorResBody>} res
   */
  async (req, res) => {
    const { fullname, username, email, password } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }],
        },
      });

      if (existingUser) {
        /** @type {ErrorsMap} */
        const errors = {};
        if (existingUser.getDataValue("username") === username) {
          errors.username = { message: "Username already exists" };
        }
        if (existingUser.getDataValue("email") === email) {
          errors.email = { message: "Email already exists" };
        }
        return res.status(400).json({ errors });
      }

      // Create new user
      const newUser = await User.create({
        fullname,
        username,
        email,
        password,
      });

      res.status(201).json({
        message: "User registered successfully",
        userId: newUser.getDataValue("id"),
      });
    } catch (error) {
      /**
       * @type {import("sequelize").ValidationError}
       */
      // @ts-ignore
      const err = error;

      if (err.name === "SequelizeValidationError") {
        /** @type {ErrorsMap} */
        const errors = {};
        err.errors.forEach((validationError, index) => {
          const errorKey = validationError.path || `error_${index}`;
          errors[errorKey] = { message: validationError.message };
        });
        return res.status(400).json({ errors });
      }
      console.error(error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
    }
  }
);

/**
 * @typedef {Object} ForgotPasswordBody
 * @property {string} email - Email address for password reset
 */

/**
 * @typedef {Object} ForgotPasswordSuccessResBody
 * @property {string} message - Success message
 */
router.post(
  "/forgot-password",
  /**
   * POST /forgot-password
   * @param {express.Request<{}, ForgotPasswordSuccessResBody | ErrorResBody, ForgotPasswordBody>} req
   * @param {express.Response<ForgotPasswordSuccessResBody | ErrorResBody>} res
   */
  async (req, res) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({
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
      const { data, error } = await resend.emails.send({
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
        console.error("Email sending error:", error);
        return res.status(500).json({
          errors: { server: { message: "Failed to send reset email" } },
        });
      }

      res.status(200).json({
        message: "Password reset email sent",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
    }
  }
);

/**
 * @typedef {Object} ResetPasswordBody
 * @property {string} token
 * @property {string} newPassword
 */

/**
 * @typedef {Object} ResetPasswordSuccessResBody
 * @property {string} message - Success message
 */

router.post(
  "/reset-password",
  /**
   * POST /reset-password
   * @param {express.Request<{}, ResetPasswordSuccessResBody | ErrorResBody, ResetPasswordBody>} req
   * @param {express.Response<ResetPasswordSuccessResBody | ErrorResBody>} res
   */
  async (req, res) => {
    const { token, newPassword } = req.body;
    try {
      const user = await User.findOne({
        where: {
          resetToken: token,
          resetTokenExpiry: { [Op.gt]: new Date() },
        },
      });

      if (!user) {
        return res.status(400).json({
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
      console.error("Reset password error:", error);
      res.status(500).json({ errors: { server: { message: "Server error" } } });
    }
  }
);

export default router;
