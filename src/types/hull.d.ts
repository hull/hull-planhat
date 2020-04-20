declare module "hull" {
  import { Logger, loggers } from "winston";
  import { Application } from "express";

  const logger: Logger;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  class Connector {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(config: any);

    public setupApp(app: Application): void;

    public startApp(app: Application): void;
  }
}
