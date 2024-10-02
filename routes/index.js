import express from "express";
import { HttpError } from "http-errors-enhanced";
import authRouter from "./auth.js";
import plansRouter from "./plans.js";
import usersRouter from "./users.js";
import paymentMethodRouter from "./payment-methods.js";
import appDedicatedServerPlansRouter from "./app-dedicated-server-plans.js";
import appsRouter from "./apps.js";
import webhookRouter from "./webhooks.js";

const api = express.Router();
api.use("/webhook", webhookRouter);

api.use(express.json());
api.use(express.urlencoded({ extended: true }));

api.use("/auth", authRouter);
api.use("/plans", plansRouter);
api.use("/users", usersRouter);
api.use("/payment-methods", paymentMethodRouter);
api.use("/app-dedicated-server-plans", appDedicatedServerPlansRouter);
api.use("/apps", appsRouter);

api.use(
  /**
   *
   * @param {Error | HttpError & import('../types/http.js').ErrorResBody} err
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {express.NextFunction} next
   */
  (err, req, res, next) => {
    if (err instanceof HttpError) {
      if (err.errors) {
        return res.status(err.statusCode).json({ errors: err.errors });
      }
      return res.status(err.statusCode).json({
        errors: { server: { message: err.message } },
      });
    }

    res.status(500).json({ errors: { server: { message: "Server error" } } });
  }
);

export default api;
