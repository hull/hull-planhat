import _ from "lodash";
import { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { smartNotifierHandler } from "hull/lib/utils";
import actions from "./actions";
import authMiddleware from "./utils/auth-middleware";

const server = (app: Application): Application => {
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
        "user:update": actions.userUpdate({ isBatch: true }),
        "account:update": actions.accountUpdate({ isBatch: true }),
      },
    }),
  );

  // CORS enabled endpoints for manifest.json
  app.get("/schema/(:type)", cors(), actions.fieldsSchema);

  // Internal API
  const jsonParser = bodyParser.json();

  app.get("/api/internal/users", cors(), authMiddleware, actions.listUsers);
  app.get(
    "/api/internal/users/:userId",
    cors(),
    authMiddleware,
    actions.getUserById,
  );
  app.post(
    "/api/internal/users",
    cors(),
    authMiddleware,
    jsonParser,
    actions.createUser,
  );
  app.put(
    "/api/internal/users/:userId",
    cors(),
    authMiddleware,
    jsonParser,
    actions.updateUser,
  );

  return app;
};

// eslint-disable-next-line import/no-default-export
export default server;
