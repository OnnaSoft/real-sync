import logger from "&/lib/logger";
import { S3Client } from "@aws-sdk/client-s3";

const requiredEnvVars = [
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "S3_BUCKET_NAME",
  "S3_BUCKET_URL",
];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  logger.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

const awsRegion = process.env.AWS_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID!;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;
const s3BucketName = process.env.S3_BUCKET_NAME;
const s3BucketUrl = process.env.S3_BUCKET_URL;

export const s3Client = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  },
});

export { s3BucketName, s3BucketUrl };

