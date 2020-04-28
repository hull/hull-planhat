import _ from "lodash";
import { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { smartNotifierHandler } from "hull/lib/utils";
import { createContainer, asValue, asClass } from "awilix";
import { ClientOpts } from "redis";
import actions from "./actions";
import authMiddleware from "./utils/auth-middleware";
import redisMiddlewareFactory from "./utils/redis-middleware";
import { ConnectorRedisClient } from "./utils/redis-client";

const server = (app: Application): Application => {
  // DI Container
  const container = createContainer();

  // DI for Redis
  const redisClientOpts: ClientOpts = {
    url: process.env.REDIS_URL,
  };

  container.register({
    redisClient: asClass(ConnectorRedisClient).singleton(),
    redisClientOpts: asValue(redisClientOpts),
    logger: asValue(console),
  });

  // Hull platform handler endpoints
  app.post(
    "/smart-notifier",
    smartNotifierHandler({
      handlers: {
        "user:update": actions.userUpdate({
          flowControl: {
            type: "next",
            size: parseInt(_.get(process.env.FLOW_CONTROL_SIZE, "200"), 10),
            in: parseInt(_.get(process.env.FLOW_CONTROL_IN, "5"), 10),
            in_time: parseInt(
              _.get(process.env.FLOW_CONTROL_IN_TIME, "60000"),
              10,
            ),
          },
          container,
        }),
        "account:update": actions.accountUpdate({
          flowControl: {
            type: "next",
            size: parseInt(_.get(process.env.FLOW_CONTROL_SIZE, "20"), 10),
            in: parseInt(_.get(process.env.FLOW_CONTROL_IN, "5"), 10),
            in_time: parseInt(
              _.get(process.env.FLOW_CONTROL_IN_TIME, "60000"),
              10,
            ),
          },
          container,
        }),
      },
    }),
  );

  app.use(
    "/batch",
    smartNotifierHandler({
      userHandlerOptions: {
        groupTraits: false,
      },
      handlers: {
        "user:update": actions.userUpdate({ isBatch: true, container }),
        "account:update": actions.accountUpdate({ isBatch: true, container }),
      },
    }),
  );

  // Fetch endpoints (incoming data)
  app.use(
    "/fetch/accounts",
    redisMiddlewareFactory(container),
    actions.fetchAccounts(container),
  );

  // Status endpoint
  app.use(
    "/status",
    redisMiddlewareFactory(container),
    actions.status(container),
  );

  // CORS enabled endpoints for manifest.json
  app.get("/schema/(:type)", cors(), actions.fieldsSchema);

  // Internal API
  const jsonParser = bodyParser.json();

  app.get(
    "/api/internal/users",
    cors(),
    authMiddleware,
    redisMiddlewareFactory(container),
    actions.listUsers,
  );
  app.get(
    "/api/internal/users/:userId",
    cors(),
    authMiddleware,
    redisMiddlewareFactory(container),
    actions.getUserById,
  );
  app.post(
    "/api/internal/users",
    cors(),
    authMiddleware,
    redisMiddlewareFactory(container),
    jsonParser,
    actions.createUser,
  );
  app.put(
    "/api/internal/users/:userId",
    cors(),
    authMiddleware,
    redisMiddlewareFactory(container),
    jsonParser,
    actions.updateUser,
  );

  // Dispose the container when the server closes
  app.on("close", () => {
    // eslint-disable-next-line no-console
    console.log("Shutting down application...");
    try {
      const redisClient = container.resolve(
        "redisClient",
      ) as ConnectorRedisClient;
      redisClient.end();
    } finally {
      container.dispose();
    }
  });

  process.on("SIGINT", () => {
    // eslint-disable-next-line no-console
    console.log("Shutting down application on SIGINT...");
    if (!container) {
      return;
    }
    try {
      const redisClient = container.resolve(
        "redisClient",
      ) as ConnectorRedisClient;
      redisClient.end();
      // eslint-disable-next-line no-console
      console.log("Terminated Redis clients.");
    } finally {
      container.dispose();
    }
  });

  return app;
};

// eslint-disable-next-line import/no-default-export
export default server;
