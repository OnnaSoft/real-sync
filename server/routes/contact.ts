import { NextFunction, Request, Response, Router } from "express";
import { HttpError } from "http-errors-enhanced";
import resend from "&/lib/resend";
import logger from "&/lib/logger";
import Joi from "joi";
import { validateRequest } from "&/middlewares/validateRequest";

// Validate environment variables
const requiredEnvVars = ["FROM_EMAIL", "TO_EMAIL"];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  logger.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

const fromEmail = process.env.FROM_EMAIL;
const toEmail = process.env.TO_EMAIL;

const contactRouter = Router();

interface ContactRequestBody {
  name: string;
  email: string;
  message: string;
}

type ApiResponse = {
  message: string;
};

const contactSchema = Joi.object<ContactRequestBody>({
  name: Joi.string().required().min(2).max(255).trim().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least {#limit} characters long",
    "string.max": "Name cannot exceed {#limit} characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().trim().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email cannot be empty",
    "string.email": "Invalid email address",
    "any.required": "Email is required",
  }),
  message: Joi.string().required().min(10).max(5000).trim().messages({
    "string.base": "Message must be a string",
    "string.empty": "Message cannot be empty",
    "string.min": "Message must be at least {#limit} characters long",
    "string.max": "Message cannot exceed {#limit} characters",
    "any.required": "Message is required",
  }),
});

contactRouter.post(
  "/",
  validateRequest(contactSchema),
  async (
    req: Request<{}, {}, ContactRequestBody>,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      throw new HttpError(400, "All fields are required");
    }

    if (!fromEmail || !toEmail) {
      logger.error("Missing required environment variables");
      throw new HttpError(500, "Server configuration error");
    }

    try {
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: [toEmail],
        subject: "New Contact Message",
        html: `
          <h1>New Contact Message</h1>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong> ${message}</p>
      `,
      });

      if (error) {
        logger.error("Error sending email:", error);
        throw new HttpError(
          500,
          "Error sending message. Please try again later."
        );
      }

      res.json({
        message: "Message sent successfully",
      });
    } catch (error) {
      logger.error("Unexpected error while sending email:", error);
      next(error);
    }
  }
);

export default contactRouter;
