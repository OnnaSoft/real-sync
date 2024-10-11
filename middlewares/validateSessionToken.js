import jwt from "jsonwebtoken";
import { User } from "../db.js";

/**
 * @param {import("../types/http").RequestWithSession} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
const validateSessionToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET ?? "",
    /**
     * @param {jwt.VerifyErrors | null} err
     * @param {string | jwt.JwtPayload | undefined} session
     * @returns
     */
    async (err, session) => {
      const unauthorizedError = { error: "Unauthorized" };
      if (err) return res.status(401).json(unauthorizedError);
      if (!session) return res.status(401).json(unauthorizedError);
      if (typeof session === "string")
        return res.status(401).json(unauthorizedError);

      try {
        const user = await User.findOne({ where: { id: session.userId } });
        if (!user) return res.status(401).json(unauthorizedError);

        req.user = {
          id: user.getDataValue("id"),
          username: user.getDataValue("username"),
          email: user.getDataValue("email"),
          fullname: user.getDataValue("fullname"),
          stripeCustomerId: user.getDataValue("stripeCustomerId"),
          userSubscriptions: [],
        };
        next();
      } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  );
};

export default validateSessionToken;
