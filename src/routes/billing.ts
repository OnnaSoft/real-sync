import { Response, NextFunction, Router } from 'express';
import { HttpError } from 'http-errors-enhanced';
import stripe from 'src/lib/stripe';
import validateSessionToken, { RequestWithUser } from 'src/middlewares/validateSessionToken';

interface BillingHistory {
    id: string;
    date: string;
    amount: number;
    status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void' | null;
    invoice: string | null;
    pdfUrl: string | null;
}

interface BillingHistoryResponse {
    data: BillingHistory[];
}

const billingRouter = Router();

billingRouter.get('/', validateSessionToken, async (req: RequestWithUser, res: Response<BillingHistoryResponse>, next: NextFunction) => {
    try {
        if (!req.user?.stripeCustomerId) {
            throw new HttpError(401, "Unauthorized");
        }

        const invoices = await stripe.invoices.list({
            customer: req.user?.stripeCustomerId,
            limit: 100,
        });

        const billingHistory = await Promise.all(invoices.data.map(async (invoice): Promise<BillingHistory> => {
            let pdfUrl = null;
            if (invoice.invoice_pdf) {
                pdfUrl = invoice.invoice_pdf;
            } else if (invoice.id) {
                try {
                    const invoiceData = await stripe.invoices.retrieve(invoice.id);
                    pdfUrl = invoiceData.invoice_pdf ?? null;
                } catch (error) {
                    console.error(`Error retrieving PDF for invoice ${invoice.id}:`, error);
                }
            }

            return {
                id: invoice.id,
                date: new Date(invoice.created * 1000).toISOString(),
                amount: invoice.amount_paid / 100,
                status: invoice.status,
                invoice: invoice.number,
                pdfUrl: pdfUrl,
            };
        }));

        res.status(200).json({
            data: billingHistory,
        });
    } catch (error) {
        console.trace(error);
        next(error);
    }
});

export default billingRouter;