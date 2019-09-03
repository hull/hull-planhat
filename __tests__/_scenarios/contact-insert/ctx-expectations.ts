import _ from "lodash";
import { ContextMock } from "../../_helpers/mocks";
import { API_PREFIX } from "../../_helpers/constants";


const setupExpectations = (ctx: ContextMock) => {
    expect((ctx.client.logger.info as any).mock.calls).toHaveLength(1);
    expect((ctx.client.logger.info as any).mock.calls[0])
    .toEqual(["outgoing.user.success", {
      endpoint: `https://${API_PREFIX}.planhat.com/endusers`,
      data: {
        companyId: "vhoih28[hbnjnmwjnjbfoho",
        createDate: new Date(1563804862).toISOString(),
        email: "test1@hull.io",
        name: "John Miller"
      },
      record: {
        companyId: "vhoih28[hbnjnmwjnjbfoho",
        email: "test1@hull.io",
        name: "John Miller"
      },
      success: true,
      method: "insert",
      error: undefined
    }]);
};

export default setupExpectations;