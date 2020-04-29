import { Request, Response, RequestHandler } from "express";
import { AwilixContainer } from "awilix";
import SyncAgent from "../core/sync-agent";

export const userFetchFactory = (
  container: AwilixContainer,
): RequestHandler => {
  return async (req: Request, res: Response): Promise<unknown> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { client, ship, metric } = (req as any).hull;
      const syncAgent = new SyncAgent(client, ship, metric, container);
      res.status(200).json({ ok: true });
      await syncAgent.fetchIncoming("endusers");
      return Promise.resolve(true);
    } catch (error) {
      res.status(500).send({
        ok: false,
        message: "Unknown error",
        error: { message: error.message },
      });
      return Promise.resolve(false);
    }
  };
};
