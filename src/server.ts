import _ from "lodash";
import { Application } from "express";
import cors from "cors";
import { notifHandler, smartNotifierHandler } from "hull/lib/utils";
import actions from "./actions";

const server = (app: Application): Application => {
    // Hull platform handler endpoints
    app.post("/smart-notifier", smartNotifierHandler({
        handlers: {
            "user:update": actions.userUpdate({
                flowControl: {
                    type: "next",
                    size: parseInt(_.get(process.env.FLOW_CONTROL_SIZE, "200"), 10),
                    in: parseInt(_.get(process.env.FLOW_CONTROL_IN, "5"), 10),
                    in_time: parseInt(_.get(process.env.FLOW_CONTROL_IN_TIME, "60000"), 10)
                  }
            }),
            "account:update": actions.accountUpdate({
                flowControl: {
                    type: "next",
                    size: parseInt(_.get(process.env.FLOW_CONTROL_SIZE, "20"), 10),
                    in: parseInt(_.get(process.env.FLOW_CONTROL_IN, "5"), 10),
                    in_time: parseInt(_.get(process.env.FLOW_CONTROL_IN_TIME, "60000"), 10)
                  }
            })
        }
    }));

    // CORS enabled endpoints for manifest.json
    app.get("/schema/(:type)", cors(), actions.fieldsSchema);

    return app;
}

export default server;
