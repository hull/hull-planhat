import nock from "nock";
import { Url } from "url";
import { API_PREFIX, PERSONAL_ACCESS_TOKEN } from "../../_helpers/constants";
import { IPlanhatContact } from "../../../src/core/planhat-objects";
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

  nockFn(`https://${API_PREFIX}.planhat.com`)
    .matchHeader("authorization", `Bearer ${PERSONAL_ACCESS_TOKEN}`)
    .get("/users")
    .reply(200, planhatUsersResponse, { "Content-Type": "application/json" });

  nockFn(`https://${API_PREFIX}.planhat.com`)
    .matchHeader("authorization", `Bearer ${PERSONAL_ACCESS_TOKEN}`)
    .get(`/leancompanies?externalId=vhoih28[hbnjnmwjnjbfoho`)
    .reply(200, [], { "Content-Type": "application/json" });

  nockFn(`https://${API_PREFIX}.planhat.com`)
    .matchHeader("authorization", `Bearer ${PERSONAL_ACCESS_TOKEN}`)
    .post("/companies")
    .reply(500, "Failed to create company", {
      "Content-Type": "text/html; charset=utf-8",
    });
};

// eslint-disable-next-line import/no-default-export
export default setupApiMockResponses;
