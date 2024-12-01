import express from "express";
import { HttpError } from "http-errors-enhanced";
import { ErrorResBody } from "&/types/http";
import authRouter from "&/routes/auth";
import plansRouter from "&/routes/plans";
import usersRouter from "&/routes/users";
import paymentMethodRouter from "&/routes/payment-methods";
import webhookRouter from "&/routes/webhooks";
import billingRouter from "&/routes/billing";
import tunnelsRouter from "&/routes/tunnels";
import consumptionRouter from "&/routes/consumption";

const api = express.Router();
api.use("/webhook", webhookRouter);

api.use(express.json());
api.use(express.urlencoded({ extended: true }));

api.use("/auth", authRouter);
api.use("/plans", plansRouter);
api.use("/users", usersRouter);
api.use("/billing", billingRouter);
api.use("/tunnels", tunnelsRouter);
api.use("/payment-methods", paymentMethodRouter);
api.use("/consumption", consumptionRouter);

api.use(
  // @ts-expect-error
  (err: Error | HttpError & ErrorResBody, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof HttpError) {
      if (err.errors) {
        return res.status(err.statusCode).json({ errors: err.errors });
      }
      return res.status(err.statusCode).json({
        errors: { server: { message: err.message } },
      });
    }

    res.status(500).json({ errors: { server: { message: err.message } } });
  }
);

export default api;
