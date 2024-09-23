import express from "express";
import { User } from "../db.js"; // Assuming you've set up your models index file
import { Op } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// Validate required environment variables
const requiredEnvVars = ["JWT_SECRET", "JWT_EXPIRATION"];
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
 * @typedef {Object} LoginSuccessResBody
 * @property {string} message - Success message
 * @property {number} userId - ID of the logged in user
 * @property {string} token - JWT token
 */

/**
 * @typedef {Object} ErrorItem
 * @property {string} message - The error message
 */

/**
 * @typedef {Object.<string, ErrorItem>} ErrorsMap
 */

/**
 * @typedef {Object} ErrorResBody
 * @property {ErrorsMap} errors - Map of error items
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
        userId: user.getDataValue("id"),
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

export default router;
