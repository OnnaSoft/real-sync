import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../db';

interface JwtPayload {
  userId: number;
  username: string;
}

export interface RequestWithUser extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    fullname: string;
    stripeCustomerId: string | null;
  };
}

const validateSessionToken = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({ error: 'JWT secret is not configured' });
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
        stripeCustomerId: user.getDataValue('stripeCustomerId'),
      };
      next();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};

export default validateSessionToken;