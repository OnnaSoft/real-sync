import express from "express";
import { Plan } from "../db.js"; // Asumiendo que has configurado el archivo index de modelos
import { HttpError } from "http-errors-enhanced";

const router = express.Router();

/**
 * @typedef {Object} PlanData
 * @property {number} id - ID del plan
 * @property {string} name - Nombre del plan
 * @property {string} code - Código del plan
 * @property {number} price - Precio del plan
 * @property {string} billingPeriod - Período de facturación
 * @property {boolean} realTimeChat - Indica si incluye chat en tiempo real
 * @property {boolean} voiceCalls - Indica si incluye llamadas de voz
 * @property {boolean} videoCalls - Indica si incluye videollamadas
 * @property {number} maxApps - Número máximo de aplicaciones
 * @property {number} secureConnections - Número de conexiones seguras
 * @property {string} supportLevel - Nivel de soporte
 * @property {boolean} apiIntegration - Indica si incluye integración de API
 * @property {boolean} dedicatedAccountManager - Indica si incluye gestor de cuenta dedicado
 */

/**
 * @typedef {Object} GetPlansSuccessResBody
 * @property {string} message - Mensaje de éxito
 * @property {number} total - Número total de registros
 * @property {PlanData[]} data - Array de datos de planes
 */

router.get(
  "/",
  /**
   * GET /plans
   * @param {express.Request} req
   * @param {express.Response<GetPlansSuccessResBody>} res
   * @param {express.NextFunction} next
   */
  async (req, res, next) => {
    try {
      const plans = await Plan.findAll().catch((error) => {
        throw new HttpError(500, "Error retrieving plans");
      });

      const planData = plans.map((plan) => ({
        id: plan.getDataValue("id"),
        name: plan.getDataValue("name"),
        code: plan.getDataValue("code"),
        price: plan.getDataValue("price"),
        billingPeriod: plan.getDataValue("billingPeriod"),
        realTimeChat: plan.getDataValue("realTimeChat"),
        voiceCalls: plan.getDataValue("voiceCalls"),
        videoCalls: plan.getDataValue("videoCalls"),
        maxApps: plan.getDataValue("maxApps"),
        secureConnections: plan.getDataValue("secureConnections"),
        supportLevel: plan.getDataValue("supportLevel"),
        apiIntegration: plan.getDataValue("apiIntegration"),
        dedicatedAccountManager: plan.getDataValue("dedicatedAccountManager"),
      }));

      res.status(200).json({
        message: "Plans retrieved successfully",
        total: planData.length,
        data: planData,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
