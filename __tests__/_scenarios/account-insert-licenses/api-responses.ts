import nock from "nock";
import { Url } from "url";
import { API_PREFIX, PERSONAL_ACCESS_TOKEN } from "../../_helpers/constants";
import {
  IPlanhatCompany,
  BulkUpsertResponse,
} from "../../../src/core/planhat-objects";
import planhatUsersResponse from "../../_data/planhat-users.json";

const setupApiMockResponses = (
  nockFn: (
    basePath: string | RegExp | Url,
    options?: nock.Options | undefined,
  ) => nock.Scope,
): void => {
  const dataCreatedCompany: IPlanhatCompany = {
    _id: "1234",
    name: "Test 1234 Inc.",
    slug: "test1234inc",
    shareable: {
      enabled: false,
      euIds: [],
      sunits: false,
    },
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
  };

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

  nockFn(`https://${API_PREFIX}.planhat.com`)
    .matchHeader("authorization", `Bearer ${PERSONAL_ACCESS_TOKEN}`)
    .post("/companies")
    .reply(200, dataCreatedCompany, { "Content-Type": "application/json" });

  nockFn(`https://${API_PREFIX}.planhat.com`)
    .matchHeader("authorization", `Bearer ${PERSONAL_ACCESS_TOKEN}`)
    .get("/users")
    .reply(200, planhatUsersResponse, { "Content-Type": "application/json" });

  nockFn(`https://${API_PREFIX}.planhat.com`)
    .matchHeader("authorization", `Bearer ${PERSONAL_ACCESS_TOKEN}`)
    .put(`/licenses`)
    .reply(200, dataLicensesBulk, { "Content-Type": "application/json" });
};

// eslint-disable-next-line import/no-default-export
export default setupApiMockResponses;
