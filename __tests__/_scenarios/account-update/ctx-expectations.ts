import { ContextMock } from "../../_helpers/mocks";

/* eslint-disable @typescript-eslint/no-explicit-any */
const setupExpectations = (ctx: ContextMock): void => {
  expect((ctx.client.logger.info as any).mock.calls).toHaveLength(1);
  expect((ctx.client.logger.info as any).mock.calls[0]).toEqual([
    "outgoing.account.success",
    {
      data: {
        _id: "1234",
        name: "Test 1234",
        slug: "test1234inc",
        shareable: { enabled: false, euIds: [], sunits: false },
        followers: [],
        domains: [],
        collaborators: [],
        products: [],
        tags: [],
        lastPerformedTriggers: [],
        createDate: "2019-09-18T08:16:31.223Z",
        lastUpdated: "2019-09-18T08:16:31.223Z",
        lastTouchByType: {},
        sales: [],
        licenses: [],
        features: {},
        sunits: {},
        usage: {},
        csmScoreLog: [],
        documents: [],
        links: [],
        alerts: [],
        lastActivities: [],
        nrr30: 0,
        nrrTotal: 0,
        mrrTotal: 0,
        mrr: 0,
        status: "prospect",
        mr: 0,
        mrTotal: 0,
        __v: 0,
      },
      endpoint: "https://api.planhat.com/companies/1234",
      error: undefined,
      method: "update",
      record: {
        externalId: "vhoih28[hbnjnmwjnjbfoho",
        id: "1234",
        name: "Test 1234",
      },
      success: true,
    },
  ]);
};

/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line import/no-default-export
export default setupExpectations;
