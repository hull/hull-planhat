import { ContextMock } from "../../_helpers/mocks";

/* eslint-disable @typescript-eslint/no-explicit-any */
const setupExpectations = (ctx: ContextMock): void => {
  expect((ctx.client.logger.info as any).mock.calls).toHaveLength(2);
  expect((ctx.client.logger.info as any).mock.calls[0]).toEqual([
    "outgoing.user.skip",
    {
      reason:
        "All mapped attributes are already in sync between Hull and Planhat.",
    },
  ]);
  expect((ctx.client.logger.info as any).mock.calls[1]).toEqual([
    "outgoing.user_event.success",
    {
      data: "",
      endpoint: "https://analytics.planhat.com/analytics/tenant1234",
      error: undefined,
      method: "insert",
      record: {
        action: "Account created",
        companyExternalId: "vhoih28[hbnjnmwjnjbfoho",
        date: "2020-04-14T19:03:05.674Z",
        email: "test1@hull.io",
        info: {
          account_id: "jgrh2phgbph",
          name: "Test account",
        },
        name: "John Miller",
      },
      success: true,
    },
  ]);
};

/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line import/no-default-export
export default setupExpectations;
