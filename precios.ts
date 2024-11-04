import Stripe from 'stripe';
import dotenv from 'dotenv';
import { CustomHttpClient } from '@onna-soft/stripe-bun';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-10-28.acacia',
    httpClient: new CustomHttpClient(),
});

interface PlanAttributes {
    code: string;
    name: string;
    basePrice: number;
    freeDataTransferGB: number;
    pricePerAdditional10GB: number;
    billingPeriod: 'monthly' | 'yearly';
    supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
    apiIntegration: boolean;
    dedicatedAccountManager: boolean;
    stripePriceId: string;
}

const defaultPlans: Array<Omit<PlanAttributes, "id">> = [
    {
        code: "FREE",
        name: "Free",
        basePrice: 0,
        freeDataTransferGB: 10,
        pricePerAdditional10GB: 12,
        billingPeriod: "monthly",
        supportLevel: "community",
        apiIntegration: true,
        dedicatedAccountManager: false,
        stripePriceId: process.env.STRIPE_FREE_PRICE_ID ?? "",
    },
    {
        code: "PRO",
        name: "Pro",
        basePrice: 50,
        freeDataTransferGB: 50,
        pricePerAdditional10GB: 10,
        billingPeriod: "monthly",
        supportLevel: "email",
        apiIntegration: true,
        dedicatedAccountManager: false,
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    },
    {
        code: "BUSINESS",
        name: "Business",
        basePrice: 100,
        freeDataTransferGB: 1000,
        pricePerAdditional10GB: 8,
        billingPeriod: "monthly",
        supportLevel: "priority",
        apiIntegration: true,
        dedicatedAccountManager: true,
        stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID ?? "",
    },
];

async function createRealSyncProduct() {
    try {
        const product = await stripe.products.create({
            name: 'RealSync',
            description: 'RealSync subscription service',
        });
        console.log('Created RealSync product:', product.id);
        return product.id;
    } catch (error) {
        if (error instanceof Stripe.errors.StripeError) {
            console.error('Error creating RealSync product:', error.message);
        } else {
            console.error('Unexpected error creating RealSync product:', error);
        }
        throw error;
    }
}
async function createStripePrices(productId: string) {
    for (const plan of defaultPlans) {
        try {
            const price = await stripe.prices.create({
                product: productId,
                currency: 'usd',
                recurring: {
                    interval: plan.billingPeriod === 'monthly' ? 'month' : 'year',
                    usage_type: 'metered',
                },
                billing_scheme: 'tiered',
                tiers_mode: 'graduated',
                tiers: [
                    {
                        up_to: plan.freeDataTransferGB,
                        flat_amount: plan.basePrice * 100,
                        unit_amount: 0,
                    },
                    {
                        up_to: 'inf',
                        unit_amount: plan.pricePerAdditional10GB * 10,
                    },
                ],
                nickname: `${plan.name} Price`,
            });

            console.log(`Created price for plan ${plan.name}:`);
            console.log(`Price ID: ${price.id}`);

            await updatePlanInDatabase(plan.code, price.id);

        } catch (error) {
            if (error instanceof Stripe.errors.StripeError) {
                console.error(`Error creating price for plan ${plan.name}:`, error.message);
            } else {
                console.error(`Unexpected error creating price for plan ${plan.name}:`, error);
            }
        }
    }
}

async function updatePlanInDatabase(planCode: string, stripePriceId: string) {
    // Aquí deberías implementar la lógica para actualizar tu base de datos
    // Por ejemplo, usando Sequelize:
    // await Plan.update(
    //   { stripePriceId: stripePriceId },
    //   { where: { code: planCode } }
    // );
    console.log(`Updated plan ${planCode} with Stripe Price ID: ${stripePriceId}`);
}


async function main() {
    try {
        const productId = await createRealSyncProduct();
        await createStripePrices(productId);
        console.log('Finished creating RealSync product and prices in Stripe');
    } catch (error) {
        console.error('Failed to create RealSync product and prices:', error);
    }
}

main();