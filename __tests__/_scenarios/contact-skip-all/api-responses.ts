import nock from "nock";
import { Url } from "url";

const setupApiMockResponses = (nockFn: (basePath: string | RegExp | Url, options?: nock.Options | undefined) => nock.Scope) => {
    // Nothing to mock, no API calls expected
}

export default setupApiMockResponses;