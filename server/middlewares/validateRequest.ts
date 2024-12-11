import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ObjectSchema } from "joi";

/**
 * Middleware de validación para Joi con tipado en Request y Response.
 * 
 * @param schema - Esquema de Joi para validar el cuerpo de la solicitud
 */
export function validateRequest<T extends object>(
  schema: ObjectSchema<T>
) {
  return (
    req: Request<ParamsDictionary, any, T>,
    res: Response<{ errors: string[] }>,
    next: NextFunction
  ) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      res.status(400).json({ errors });
      return;
    }

    next();
  };
}
