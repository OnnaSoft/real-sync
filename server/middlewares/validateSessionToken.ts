import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as core from "express-serve-static-core";
import { User } from '../db';
import { HttpError } from 'http-errors-enhanced';
import { getRedisInstance } from '&/redis';
import logger from '&/lib/logger';

const requiredEnvVars = [
  "JWT_SECRET"
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

const jwtSecret = process.env.JWT_SECRET as string;

interface JwtPayload {
  userId: number;
  username: string;
}

export interface RequestWithUser<
  P = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = core.Query,
  Locals extends Record<string, any> = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user?: {
    id: number;
    username: string;
    email: string;
    fullname: string;
    avatarUrl?: string;
    stripeCustomerId: string | null;
  };
}

const validateSessionToken = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  try {
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const redisCli = await getRedisInstance()
      .catch((error) => {
        logger.error("Failed to get Redis client", { error: error.message });
        throw new HttpError(500, "Failed to register user");
      });
    const payload = jwt.decode(token);
    if (!payload || typeof payload === 'string') {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const { userId } = payload as JwtPayload;
    const validate = await redisCli.get(`user:${userId}:token`);

    if (validate !== token) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    jwt.verify(token, jwtSecret, async (err, session) => {
      const unauthorizedError = { error: 'Unauthorized' };
      if (err) {
        res.status(401).json(unauthorizedError);
        return;
      }
      if (!session || typeof session === 'string') {
        res.status(401).json(unauthorizedError);
        return;
      }
  
      const { userId } = session as JwtPayload;
  
      try {
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
          res.status(401).json(unauthorizedError);
          return;
        }
  
        req.user = {
          id: user.getDataValue('id'),
          username: user.getDataValue('username'),
          email: user.getDataValue('email'),
          fullname: user.getDataValue('fullname'),
          avatarUrl: user.getDataValue('avatarUrl'),
          stripeCustomerId: user.getDataValue('stripeCustomerId'),
        };
        next();
      } catch (error) {
        next(new HttpError(500, 'Internal server error'));
      }
    });
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }
    next(new HttpError(500, 'Internal server error'));
  }
};

export default validateSessionToken;