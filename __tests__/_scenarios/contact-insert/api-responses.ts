import nock from "nock";
import { Url } from "url";
import { API_PREFIX, PERSONAL_ACCESS_TOKEN } from "../../_helpers/constants";
import {
  IPlanhatContact,
  IPlanhatCompany,
} from "../../../src/core/planhat-objects";
import planhatUsersResponse from "../../_data/planhat-users.json";

const setupApiMockResponses = (
  nockFn: (
    basePath: string | RegExp | Url,
    options?: nock.Options | undefined,
  ) => nock.Scope,
): void => {
  const dataCreatedContact: IPlanhatContact = {
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
  };

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

  nockFn(`https://${API_PREFIX}.planhat.com`)
    .matchHeader("authorization", `Bearer ${PERSONAL_ACCESS_TOKEN}`)
    .get(`/endusers?email=${dataCreatedContact.email}`)
    .reply(200, { data: [] }, { "Content-Type": "application/json" });

  nockFn(`https://${API_PREFIX}.planhat.com`)
    .matchHeader("authorization", `Bearer ${PERSONAL_ACCESS_TOKEN}`)
    .post("/endusers")
    .reply(200, dataCreatedContact, { "Content-Type": "application/json" });

  nockFn(`https://${API_PREFIX}.planhat.com`)
    .matchHeader("authorization", `Bearer ${PERSONAL_ACCESS_TOKEN}`)
    .get("/leancompanies?externalId=vhoih28[hbnjnmwjnjbfoho")
    .reply(200, [], { "Content-Type": "application/json" });

  nockFn(`https://${API_PREFIX}.planhat.com`)
    .matchHeader("authorization", `Bearer ${PERSONAL_ACCESS_TOKEN}`)
    .post("/companies")
    .reply(200, dataCreatedCompany, { "Content-Type": "application/json" });

  nockFn(`https://${API_PREFIX}.planhat.com`)
    .matchHeader("authorization", `Bearer ${PERSONAL_ACCESS_TOKEN}`)
    .get("/users")
    .reply(200, planhatUsersResponse, { "Content-Type": "application/json" });
};

// eslint-disable-next-line import/no-default-export
export default setupApiMockResponses;
