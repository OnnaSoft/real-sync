import express, { Request, Response, NextFunction } from 'express';
import stripe from 'src/lib/stripe';

interface BillingHistory {
    id: string;
    date: string;
    amount: number;
    status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void' | null
    invoice: string | null;
}

interface BillingHistoryResponse {
    data: BillingHistory[];
}

const billingRouter = express.Router();

billingRouter.get('/', async (req: Request, res: Response<BillingHistoryResponse>, next: NextFunction) => {
    try {
        const invoices = await stripe.invoices.list({
            limit: 100,
        });

        const billingHistory = invoices.data.map((invoice): BillingHistory => ({
            id: invoice.id,
            date: new Date(invoice.created * 1000).toISOString(),
            amount: invoice.amount_paid / 100,
            status: invoice.status,
            invoice: invoice.number,
        }));

        res.status(200).json({
            data: billingHistory,
        });
    } catch (error) {
        next(error);
    }
});

export default billingRouter;