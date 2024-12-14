import express, { Response, NextFunction } from 'express';
import validateSessionToken, { RequestWithUser } from '&/middlewares/validateSessionToken';
import { sequelize, Tunnel } from '../db';
import { HttpError } from 'http-errors-enhanced';
import { generateUniqueKey } from '&/lib/utils';
import { Domain } from '&/types/models';
import fetch from 'node-fetch';
import { Transaction } from 'sequelize';

interface CreateTunnelBody {
  domain: string;
  allowMultipleConnections: boolean;
  isEnabled: boolean;
}

interface TunnelResponse {
  id: number;
  domain: string;
  apiKey: string;
  isEnabled: boolean;
  allowMultipleConnections: boolean;
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
      attributes: [
        'id', 
        'domain',
        'isEnabled',
        'allowMultipleConnections',
        'createdAt', 'updatedAt'
      ]
    });

    const data = await Promise.allSettled(tunnels.map(async (tunnel) => {
      const response = await fetch(`${LIPSTICK_ENDPOINT}/domains/${tunnel.getDataValue('domain')}`, {
        headers: {
          "Authorization": LIPSTICK_APIKEY
        },
      });
      if (!response.ok) {
        return {
          id: tunnel.id,
          domain: tunnel.domain,
          apiKey: "",
          isEnabled: false,
          allowMultipleConnections: tunnel.allowMultipleConnections,
          createdAt: tunnel.createdAt,
          updatedAt: tunnel.updatedAt
        }
      }
      const lipstickResponse = await response.json() as Domain;
      return {
        id: tunnel.id,
        domain: tunnel.domain,
        apiKey: lipstickResponse.apiKey,
        isEnabled: tunnel.isEnabled,
        allowMultipleConnections: tunnel.allowMultipleConnections,
        createdAt: tunnel.createdAt,
        updatedAt: tunnel.updatedAt
      }
    }));

    res.status(200).json({
      data: data
        .filter(p => p.status === "fulfilled")
        .map(p => p.value)
    });
  } catch (error) {
    console.log(error);
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

    const { domain, allowMultipleConnections, isEnabled } = req.body;

    if (!domain) {
      throw new HttpError(400, "Domain is required");
    }

    const apiKey = generateUniqueKey();

    const newTunnel = await Tunnel.create({
      domain,
      isEnabled,
      allowMultipleConnections,
      userId: req.user.id,
    }, { transaction }).catch(async (error) => {
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
        allowMultipleConnections: newTunnel.allowMultipleConnections,
        isEnabled: newTunnel.isEnabled,
        createdAt: newTunnel.createdAt,
        updatedAt: newTunnel.updatedAt
      }
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
});

interface UpdateTunnelBody {
  isEnabled?: boolean;
  allowMultipleConnections?: boolean;
}

tunnelsRouter.patch('/:id', validateSessionToken, async (req: RequestWithUser<{ id: string }, any, UpdateTunnelBody>, res: Response, next: NextFunction) => {
  let transaction: Transaction | null = null;
  try {
    if (!req.user?.id) {
      throw new HttpError(401, "Unauthorized");
    }

    transaction = await sequelize.transaction();

    const { id } = req.params;
    const { isEnabled, allowMultipleConnections } = req.body;

    const tunnel = await Tunnel.findOne({
      where: { id, userId: req.user.id }
    });

    if (!tunnel) {
      throw new HttpError(404, "Tunnel not found");
    }

    if (typeof isEnabled === 'boolean') {
      tunnel.isEnabled = isEnabled;
    }
    if (typeof allowMultipleConnections === 'boolean') {
      tunnel.allowMultipleConnections = allowMultipleConnections;
    }
    const updateResponse = await fetch(`${LIPSTICK_ENDPOINT}/domains/${tunnel.domain}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": LIPSTICK_APIKEY
      },
      body: JSON.stringify({
        "allowMultipleConnections": tunnel.allowMultipleConnections,
        "isEnabled": tunnel.isEnabled
      })
    }).catch(() => {
      throw new HttpError(500, "Error while updating domain in Lipstick");
    });

    if (!updateResponse.ok) {
      throw new HttpError(500, "Error while updating domain in Lipstick");
    }

    await tunnel.save({ transaction });
    await transaction.commit();

    res.status(200).json({
      data: {
        id: tunnel.id,
        domain: tunnel.domain,
        isEnabled: tunnel.isEnabled,
        allowMultipleConnections: tunnel.allowMultipleConnections,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    if (transaction) await transaction.rollback().catch((error) => {
      console.error("Error while rolling back transaction", error);
    });
    next(error);
  }
});


tunnelsRouter.post('/:id/regenerate-api-key', validateSessionToken, async (req: RequestWithUser<{ id: string }>, res: Response, next: NextFunction) => {
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

    const newApiKey = generateUniqueKey();

    const updateResponse = await fetch(`${LIPSTICK_ENDPOINT}/domains/${tunnel.domain}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": LIPSTICK_APIKEY
      },
      body: JSON.stringify({
        "apiKey": newApiKey
      })
    }).catch(() => {
      throw new HttpError(500, "Error while updating API key in Lipstick");
    });

    if (!updateResponse.ok) {
      throw new HttpError(500, "Error while updating API key in Lipstick");
    }

    await transaction.commit();

    const fetchResponse = await fetch(`${LIPSTICK_ENDPOINT}/domains/${tunnel.domain}`, {
      headers: {
        "Authorization": LIPSTICK_APIKEY
      },
    });

    if (!fetchResponse.ok) {
      throw new HttpError(500, "Error while fetching updated domain from Lipstick");
    }

    const lipstickResponse = await fetchResponse.json() as Domain;

    res.status(200).json({
      data: {
        id: tunnel.id,
        domain: tunnel.domain,
        apiKey: lipstickResponse.apiKey,
        isEnabled: tunnel.isEnabled,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
});

export default tunnelsRouter;