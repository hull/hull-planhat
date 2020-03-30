import { Request, Response } from "express";
import _ from "lodash";
import { ClientOpts } from "redis";
import IPrivateSettings from "../types/private-settings";
import PlanhatClient from "../core/planhat-client";
import IPlanhatClientConfig from "../types/planhat-client-config";
import { ConnectorRedisClient } from "../utils/redis-client";
import { PlanhatUser } from "../core/planhat-objects";

const redisOpts: ClientOpts = {
  url: process.env.REDIS_URL,
};

const instantiateServiceClient = (req: Request): PlanhatClient => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const connector: any = (req as any).hull.ship;
  const privateSettings = _.get(
    connector,
    "private_settings",
  ) as IPrivateSettings;

  const svcClientConfig: IPlanhatClientConfig = {
    accessToken: privateSettings.personal_acccess_token || "",
    apiPrefix: privateSettings.api_prefix || "api",
    tenantId: privateSettings.tenant_id || "",
  };
  const serviceClient = new PlanhatClient(svcClientConfig);
  return serviceClient;
};

const handleUnauthorized = (res: Response): Promise<unknown> => {
  res.status(400).send({
    message:
      "Insufficient data to route request to proper organization and connector.",
  });
  return Promise.resolve(false);
};

export const listUsers = async (
  req: Request,
  res: Response,
): Promise<unknown> => {
  if (_.get(req, "hull", undefined) === undefined) {
    return handleUnauthorized(res);
  }

  try {
    const redisClient = new ConnectorRedisClient(
      redisOpts,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).hull.client.logger,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connector: any = (req as any).hull.ship;
    const svcClient = instantiateServiceClient(req);
    const cachedResult = await redisClient.get<Array<PlanhatUser>>(
      `users_${connector.id}`,
    );
    let apiResult = { data: cachedResult };
    if (
      cachedResult === undefined ||
      req.query.cacheclear === 1 ||
      req.query.cacheclear === "1"
    ) {
      apiResult = await svcClient.listUsers();
      await redisClient.set(
        `users_${connector.id}`,
        _.get(apiResult, "data", []),
        60 * 10,
      );
    }

    res.json(_.get(apiResult, "data", []));
    return Promise.resolve(true);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Unknown error", error: { message: error.message } });
    return Promise.resolve(false);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
): Promise<unknown> => {
  if (_.get(req, "hull", undefined) === undefined) {
    return handleUnauthorized(res);
  }

  let id = _.get(req, "params.userId", undefined);

  if (id === undefined) {
    res.status(404).send({ message: `Paramter userId is missing.` });
    return Promise.resolve(false);
  }

  id = _.trim(id);

  try {
    const svcClient = instantiateServiceClient(req);
    const apiResult = await svcClient.getUserById(id);

    // TODO: Add caching

    res.json(_.get(apiResult, "data", undefined));
    return Promise.resolve(true);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Unknown error", error: { message: error.message } });
    return Promise.resolve(false);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
): Promise<unknown> => {
  if (_.get(req, "hull", undefined) === undefined) {
    return handleUnauthorized(res);
  }

  try {
    const data = req.body;
    const svcClient = instantiateServiceClient(req);
    const apiResult = await svcClient.createUser(data);

    // TODO: Handle caching

    res.json(_.get(apiResult, "data", undefined));
    return Promise.resolve(true);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Unknown error", error: { message: error.message } });
    return Promise.resolve(false);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
): Promise<unknown> => {
  if (_.get(req, "hull", undefined) === undefined) {
    return handleUnauthorized(res);
  }

  let id = _.get(req, "params.userId", undefined);

  if (id === undefined) {
    res.status(404).send({ message: `Paramter userId is missing.` });
    return Promise.resolve(false);
  }

  id = _.trim(id);

  try {
    const data = req.body;
    const svcClient = instantiateServiceClient(req);
    const apiResult = await svcClient.updateUser(id, data);

    // TODO: Add caching

    res.json(_.get(apiResult, "data", undefined));
    return Promise.resolve(true);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Unknown error", error: { message: error.message } });
    return Promise.resolve(false);
  }
};
