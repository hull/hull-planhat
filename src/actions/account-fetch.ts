import { Request, Response, RequestHandler } from "express";
import { AwilixContainer } from "awilix";
import SyncAgent from "../core/sync-agent";

export const accountFetchFactory = (
  container: AwilixContainer,
): RequestHandler => {
  return async (req: Request, res: Response): Promise<unknown> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { client, ship, metric } = (req as any).hull;
      const syncAgent = new SyncAgent(client, ship, metric, container);
      res.status(200).json({ ok: true });
      await syncAgent.fetchIncoming("companies");
      return Promise.resolve(true);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((req as any).hull && (req as any).hull.client) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any).hull.client.logger.error("incoming.job.error", {
          error,
          objectType: "companies",
        });
      }
      return Promise.resolve(false);
    }
  };
};
