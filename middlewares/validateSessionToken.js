import jwt from "jsonwebtoken";
import { User } from "../db.js";

/**
 * @param {import("../types/http").RequestWithSession} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
const validateSessionToken = (req, res, next) => {
  const request = req;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    /**
     *
     * @param {Error} err
     * @param {import('../types/http').Session} session
     * @returns
     */
    async (err, session) => {
      if (err) {
        return res.status(403).json({ error: "Invalid token" });
      }
      try {
        const user = await User.findOne({ where: { id: session.userId } });
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        req.user = {
          id: user.getDataValue("id"),
          username: user.getDataValue("username"),
          email: user.getDataValue("email"),
          fullname: user.getDataValue("fullname"),
        };
        next();
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  );
};

export default validateSessionToken;
