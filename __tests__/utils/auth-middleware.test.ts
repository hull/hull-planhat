// import { Request } from "express";
import auth from "../../src/utils/auth-middleware";

/* eslint-disable @typescript-eslint/no-explicit-any */
describe("authMiddleware", () => {
  it.skip("should return 404 if request has no authorization information at all.", () => {
    const req: any = {
      headers: {},
    };
    const res: any = {
      status: jest.fn(),
    };
    const nxtMock = jest.fn();

    auth(req, res, nxtMock);

    expect(nxtMock).not.toBeCalled();
    expect(res.statusCode).toEqual(404);
  });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
