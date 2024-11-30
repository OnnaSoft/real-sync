import express, { Response, NextFunction } from 'express';
import validateSessionToken, { RequestWithUser } from '&/middlewares/validateSessionToken';
import { sequelize, Tunnel } from '../db';
import { HttpError } from 'http-errors-enhanced';
import { generateApiKey } from '&/lib/utils';
import { Domain } from '&/types/models';
import fetch from 'node-fetch';
import { Transaction } from 'sequelize';

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
    if (!req.user?.id) {
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
    }));

    res.status(200).json({ data });
  } catch (error) {
    console.trace(error);
    next(error);
  }
});

tunnelsRouter.post('/', validateSessionToken, async (req: RequestWithUser<any, any, CreateTunnelBody>, res: Response<CreateTunnelResponse>, next: NextFunction) => {
  let transaction: Transaction | null = null;
  try {
    if (!req.user?.id) {
      throw new HttpError(401, "Unauthorized");
    }

    transaction = await sequelize.transaction();

    const { domain } = req.body;

    if (!domain) {
      throw new HttpError(400, "Domain is required");
    }

    const apiKey = generateApiKey();

    const newTunnel = await Tunnel.create({
      domain,
      userId: req.user.id,
    }, { transaction }).catch(async () => {
      throw new HttpError(500, "Error while creating tunnel in database");
    });

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
    }).then((response) => {
      if (!response.ok) {
        throw new HttpError(500, "Tunnel already exists in Lipstick");
      }
    }).catch((error) => {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, "Error while creating domain in Lipstick");
    });

    await transaction.commit();

    const response = await fetch(`${LIPSTICK_ENDPOINT}/domains/${domain}`, {
      headers: {
        "Authorization": LIPSTICK_APIKEY
      },
    }).catch(() => {
      throw new HttpError(500, "Error while fetching domain from Lipstick");
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
    if (transaction) await transaction.rollback();
    next(error);
  }
});

tunnelsRouter.delete('/:id', validateSessionToken, async (req: RequestWithUser<{ id: string }>, res: Response, next: NextFunction) => {
  let transaction: Transaction | null = null;
  try {
    if (!req.user?.id) {
      throw new HttpError(401, "Unauthorized");
    }

    transaction = await sequelize.transaction();

    const { id } = req.params;

    const tunnel = await Tunnel.findOne({
      where: { id, userId: req.user.id }
    });

    if (!tunnel) {
      throw new HttpError(404, "Tunnel not found");
    }

    await tunnel.destroy({ transaction });

    const response = await fetch(`${LIPSTICK_ENDPOINT}/domains/${tunnel.domain}`, {
      method: "DELETE",
      headers: {
        "Authorization": LIPSTICK_APIKEY
      }
    });

    await transaction.commit();

    if (!response.ok) {
      throw new HttpError(500, "Error while deleting domain in Lipstick");
    }

    res.status(204).send();
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
});

export default tunnelsRouter;