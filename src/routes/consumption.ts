import { Router, Request, Response } from "express";
import Joi from "joi";
import { validateRequest } from "src/middlewares/validateRequest";

export const updateConsumptionSchema = Joi.object({
    domain: Joi.string().required().messages({
        "string.base": "El dominio debe ser una cadena.",
        "string.empty": "El dominio es requerido.",
        "any.required": "El dominio es requerido.",
    }),
    traffic: Joi.number().min(0).required().messages({
        "number.base": "El tráfico debe ser un número.",
        "number.min": "El tráfico debe ser un número positivo.",
        "any.required": "El tráfico es requerido.",
    }),
});

export interface UpdateConsumptionRequest {
    domain: string;
    traffic: number;
}

export interface UpdateConsumptionResponse {
    message: string;
}

export interface ErrorResponse {
    error: string;
}

const consumptionRouter = Router();

consumptionRouter.post(
    "/update-consumption",
    // @ts-expect-error
    validateRequest(updateConsumptionSchema),
    (req: Request<{}, {}, UpdateConsumptionRequest>, res: Response<UpdateConsumptionResponse>) => {
        const { domain, traffic } = req.body;

        // Simular lógica de procesamiento
        console.log(`Dominio: ${domain}, Tráfico: ${traffic}`);

        // Responder con éxito
        res.status(200).json({ message: "Consumo actualizado correctamente." });
    }
);