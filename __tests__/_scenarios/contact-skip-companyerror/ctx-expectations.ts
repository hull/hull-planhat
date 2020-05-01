import { ContextMock } from "../../_helpers/mocks";
import { API_PREFIX } from "../../_helpers/constants";

/* eslint-disable @typescript-eslint/no-explicit-any */
const setupExpectations = (ctx: ContextMock): void => {
  expect((ctx.client.logger.info as any).mock.calls).toHaveLength(1);
  expect((ctx.client.logger.info as any).mock.calls[0]).toEqual([
    "outgoing.user.skip",
    {
      reason: "No company id present.",
    },
  ]);
  expect((ctx.client.logger.error as any).mock.calls).toHaveLength(1);
  expect((ctx.client.logger.error as any).mock.calls[0]).toEqual([
    "outgoing.account.error",
    {
      data: "Failed to create company",
      endpoint: `https://${API_PREFIX}.planhat.com/companies`,
      error: ["Request failed with status code 500"],
      method: "insert",
      record: {
        externalId: "vhoih28[hbnjnmwjnjbfoho",
        name: "Test 1234 Inc.",
      },
      success: false,
    },
  ]);
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line import/no-default-export
export default setupExpectations;
