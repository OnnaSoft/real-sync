import express, { Response, NextFunction } from 'express';
import validateSessionToken, { RequestWithUser } from 'src/middlewares/validateSessionToken';
import { Tunnel } from '../db';
import { HttpError } from 'http-errors-enhanced';
import { generateApiKey } from 'src/lib/utils';
import { Domain } from 'src/types/models';
import fetch from 'node-fetch';

// Request Body Interfaces
interface CreateTunnelBody {
    domain: string;
}


// Response Interfaces
interface TunnelResponse {
    id: number;
    domain: string;
    apiKey: string;
    createdAt: Date;
    updatedAt: Date;
}

interface GetTunnelsResponse {
    data: TunnelResponse[];
}

interface CreateTunnelResponse {
    data: TunnelResponse;
}

const requiredEnvVars = [
    "LIPSTICK_ENDPOINT",
    "LIPSTICK_APIKEY",
];
const missingEnvVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
    console.error(
        `Missing required environment variables: ${missingEnvVars.join(", ")}`
    );
    process.exit(1);
}

const rejectUnauthorized = process.env.REJECT_UNAUTHORIZED !== 'false';
const LIPSTICK_ENDPOINT = process.env.LIPSTICK_ENDPOINT ?? "";
const LIPSTICK_APIKEY = process.env.LIPSTICK_APIKEY ?? "";

const tunnelsRouter = express.Router();

tunnelsRouter.get('/', validateSessionToken, async (req: RequestWithUser, res: Response<GetTunnelsResponse>, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            throw new HttpError(401, "Unauthorized");
        }

        const tunnels = await Tunnel.findAll({
            where: { userId: req.user.id },
            attributes: ['id', 'domain', 'createdAt', 'updatedAt']
        });

        const data = await Promise.all(tunnels.map(async (tunnel) => {
            const response = await fetch(`${LIPSTICK_ENDPOINT}/domains/${tunnel.getDataValue('domain')}`, {
                headers: {
                    "Authorization": LIPSTICK_APIKEY
                },
            });
            const lipstickResponse = await response.json() as Domain;
            return {
                id: tunnel.id,
                domain: tunnel.domain,
                apiKey: lipstickResponse.apiKey,
                createdAt: tunnel.createdAt,
                updatedAt: tunnel.updatedAt
            }
        }))

        res.status(200).json({ data });
    } catch (error) {
        console.trace(error);
        next(error);
    }
});

tunnelsRouter.post('/', validateSessionToken, async (req: RequestWithUser<any, any, CreateTunnelBody>, res: Response<CreateTunnelResponse>, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            throw new HttpError(401, "Unauthorized");
        }

        const { domain } = req.body;

        if (!domain) {
            throw new HttpError(400, "Domain is required");
        }

        const apiKey = generateApiKey();

        await fetch(`${LIPSTICK_ENDPOINT}/domains`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": LIPSTICK_APIKEY
            },
            body: JSON.stringify({
                "name": domain,
                "apiKey": apiKey
            })
        }).then((response)=> {
            if (!response.ok) {
                throw new HttpError(500, "Error while creating domain in Lipstick");
            }
        }).catch(() => {
            throw new HttpError(500, "Error while creating domain in Lipstick");
        });

        const newTunnel = await Tunnel.create({
            domain,
            userId: req.user.id,
        }).catch(async () => {
            await fetch(`${LIPSTICK_ENDPOINT}/domains/${domain}`, {
                method: "DELETE",
                headers: {
                    "Authorization": LIPSTICK_APIKEY
                }
            }).catch(() => void(0));
            throw new HttpError(500, "Error while creating tunnel in database");
        })

        const response = await fetch(`${LIPSTICK_ENDPOINT}/domains/${domain}`, {
            headers: {
                "Authorization": LIPSTICK_APIKEY
            },
        });

        const lipstickResponse = await response.json() as Domain;

        res.status(201).json({
            data: {
                id: newTunnel.id,
                domain: newTunnel.domain,
                apiKey: lipstickResponse.apiKey,
                createdAt: newTunnel.createdAt,
                updatedAt: newTunnel.updatedAt
            }
        });
    } catch (error) {
        next(error);
    }
});

tunnelsRouter.delete('/:id', validateSessionToken, async (req: RequestWithUser<{ id: string }>, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            throw new HttpError(401, "Unauthorized");
        }

        const { id } = req.params;

        const tunnel = await Tunnel.findOne({
            where: { id, userId: req.user.id }
        });

        if (!tunnel) {
            throw new HttpError(404, "Tunnel not found");
        }

        await tunnel.destroy();

        const response = await fetch(`${LIPSTICK_ENDPOINT}/domains/${tunnel.domain}`, {
            method: "DELETE",
            headers: {
                "Authorization": LIPSTICK_APIKEY
            }
        });

        if (!response.ok) {
            throw new HttpError(500, "Error while deleting domain in Lipstick");
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default tunnelsRouter;