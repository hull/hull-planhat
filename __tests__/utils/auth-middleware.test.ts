import expressRequestMock from "express-request-mock";
import auth from "../../src/utils/auth-middleware";

/* eslint-disable @typescript-eslint/no-explicit-any */
describe("authMiddleware", () => {
  it("should return 401 if request has no authorization information at all.", async () => {
    const options = { query: {} };
    const { res } = await expressRequestMock(auth, options);
    expect(res.statusCode).toEqual(401);
  });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
