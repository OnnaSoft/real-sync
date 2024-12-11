import { Request, Response, NextFunction } from 'express';

const requiredEnvVars = [
  "API_KEY",
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

const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['x-api-key'];
  const apiKey = authHeader;

  if (apiKey !== process.env.API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}

export default validateApiKey;