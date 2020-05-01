import nock from "nock";
import { Url } from "url";

const setupApiMockResponses = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  nockFn: (
    basePath: string | RegExp | Url,
    options?: nock.Options | undefined,
  ) => nock.Scope,
): void => {
  // Nothing to mock, no API calls expected
};

// eslint-disable-next-line import/no-default-export
export default setupApiMockResponses;
