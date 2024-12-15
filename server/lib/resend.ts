import { Resend } from "resend";
import logger from "&/lib/logger";

// Validate environment variables
const requiredEnvVars = ["RESEND_API_KEY", "EMAIL_TO_ADDRESS", "EMAIL_FROM_ADDRESS"];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  logger.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

export default resend;
