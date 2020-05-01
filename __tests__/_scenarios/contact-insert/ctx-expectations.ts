// import _ from "lodash";
import { ContextMock } from "../../_helpers/mocks";
import { API_PREFIX } from "../../_helpers/constants";

/* eslint-disable @typescript-eslint/no-explicit-any */
const setupExpectations = (ctx: ContextMock): void => {
  expect((ctx.client.logger.info as any).mock.calls).toHaveLength(2);
  expect((ctx.client.logger.info as any).mock.calls[0]).toEqual([
    "outgoing.account.success",
    {
      data: {
        _id: "1234",
        name: "Test 1234 Inc.",
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
      endpoint: "https://api.planhat.com/companies",
      error: undefined,
      method: "insert",
      record: {
        externalId: "vhoih28[hbnjnmwjnjbfoho",
        name: "Test 1234 Inc.",
      },
      success: true,
    },
  ]);
  expect((ctx.client.logger.info as any).mock.calls[1]).toEqual([
    "outgoing.user.success",
    {
      endpoint: `https://${API_PREFIX}.planhat.com/endusers`,
      data: {
        companyId: "1234",
        createDate: new Date(1563804862).toISOString(),
        email: "test1@hull.io",
        name: "John Miller",
        otherEmails: [],
        featured: false,
        tags: [],
        personas: [],
        npsUnsubscribed: false,
        beatTrend: 0,
        beats: 0,
        convs14: 0,
        convsTotal: 0,
        beatsTotal: 0,
        experience: 0,
        _id: "5d81eb28aeeafc7a74d8f999",
        firstName: "John",
        lastName: "Miller",
        companyName: "Test 1234 Inc.",
        lastActivities: [],
        relatedEndusers: [],
        emailMd5: "53d22e4afda071779fafc63ba1433906",
        __v: 0,
      },
      record: {
        companyId: "1234",
        email: "test1@hull.io",
        name: "John Miller",
      },
      success: true,
      method: "insert",
      error: undefined,
    },
  ]);
};

/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line import/no-default-export
export default setupExpectations;
