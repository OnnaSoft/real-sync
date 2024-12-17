import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, s3BucketName } from "&/config/s3Config";

export async function uploadFileToS3(file: Express.Multer.File, key: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: s3BucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return signedUrl;
}

