import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

/**
 * Middleware de validación para Joi con tipado en Request y Response.
 * 
 * @param schema - Esquema de Joi para validar el cuerpo de la solicitud
 */
export function validateRequest<T>(
  schema: ObjectSchema<T>
) {
  return (req: Request<{}, {}, T>, res: Response<{ errors: string[] }>, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({ errors });
    }

    next();
  };
}
