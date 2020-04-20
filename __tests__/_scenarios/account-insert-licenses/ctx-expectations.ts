import { ContextMock } from "../../_helpers/mocks";
import {
  PlanhatLicense,
  BulkUpsertResponse,
} from "../../../src/core/planhat-objects";

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
  // Compose the licenses
  const hullLicenses = [
    {
      id: "12345",
      product: "License Fee",
      currency: "USD",
      start_date: "2019-12-11T11:46:08+02:00",
      mrr: 499,
    },
  ];
  const record: PlanhatLicense[] = [
    {
      fromDate: hullLicenses[0].start_date,
      _currency: hullLicenses[0].currency,
      companyId: "1234",
      externalId: hullLicenses[0].id,
      product: hullLicenses[0].product,
      mrr: hullLicenses[0].mrr,
    },
  ];
  const dataLicensesBulk: BulkUpsertResponse = {
    created: 1,
    createdErrors: [],
    insertsKeys: [
      {
        _id: "5e2704aabf07307b89e48d6a",
      },
    ],
    updated: 0,
    updatedErrors: [],
    updatesKeys: [],
    nonupdates: 0,
    modified: [],
    upsertedIds: ["5e2704aabf07307b89e48d6a"],
  };
  expect((ctx.client.logger.info as any).mock.calls[1]).toEqual([
    "outgoing.account.success",
    {
      data: dataLicensesBulk,
      endpoint: "https://api.planhat.com/licenses",
      error: undefined,
      method: "bulkUpsert",
      record,
      success: true,
    },
  ]);
};

/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line import/no-default-export
export default setupExpectations;
