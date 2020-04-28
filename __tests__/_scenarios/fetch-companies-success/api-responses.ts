import nock from "nock";
import { Url } from "url";
import { API_PREFIX, PERSONAL_ACCESS_TOKEN } from "../../_helpers/constants";
import planhatCompaniesResponse from "../../_data/planhat-companies.json";

const setupApiMockResponses = (
  nockFn: (
    basePath: string | RegExp | Url,
    options?: nock.Options | undefined,
  ) => nock.Scope,
): void => {
  nockFn(`https://${API_PREFIX}.planhat.com`)
    .matchHeader("authorization", `Bearer ${PERSONAL_ACCESS_TOKEN}`)
    .get("/companies?offset=0&limit=100")
    .reply(200, planhatCompaniesResponse, {
      "Content-Type": "application/json",
    });
};

// eslint-disable-next-line import/no-default-export
export default setupApiMockResponses;
