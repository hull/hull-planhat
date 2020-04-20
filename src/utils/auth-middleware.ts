import _ from "lodash";
import { Request, Response, NextFunction, RequestHandler } from "express";
import Hull from "hull";
import * as basicAuth from "express-basic-auth";

/* eslint-disable @typescript-eslint/no-explicit-any */
const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): RequestHandler => {
  const orgId = _.get(req, "query.org", undefined);
  const authHandler: RequestHandler<any> = basicAuth.default({
    authorizeAsync: true,
    authorizer: (
      user: string,
      password: string,
      authorize: (err: Error | null, authenticated: boolean) => void,
    ) => {
      if (user.length > 0 && password.length > 0 && orgId !== undefined) {
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          const hull: any = new Hull({
            id: user,
            secret: password,
            organization: orgId,
          });
          hull
            .get("app")
            // eslint-disable-next-line promise/always-return
            .then((res2: any) => {
              (req as any).hull = {
                client: hull,
                config: res2,
                connector: res2,
                ship: res2,
              };
              authorize(null, true);
            })
            .catch(() => {
              authorize(null, false);
            });
        } catch {
          authorize(null, false);
        }
      } else {
        authorize(null, false);
      }
    },
  });
  return authHandler(req, res, next);
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line import/no-default-export
export default authMiddleware;
