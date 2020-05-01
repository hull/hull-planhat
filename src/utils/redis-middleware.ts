import { Request, Response, RequestHandler, NextFunction } from "express";
import { AwilixContainer } from "awilix";

const redisMiddlewareFactory = (container: AwilixContainer): RequestHandler => {
  return (
    req: Request,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _res: Response,
    next: NextFunction,
  ): void => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).redisClient = container.resolve("redisClient");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }

    next();
  };
};

// eslint-disable-next-line import/no-default-export
export default redisMiddlewareFactory;
