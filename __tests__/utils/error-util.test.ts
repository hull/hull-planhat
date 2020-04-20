import axios from "axios";
import nock from "nock";
import { ApiUtil } from "../../src/utils/api-util";
import ApiResultObject from "../../src/types/api-result";

describe("ApiUtil", () => {
  it("formats an API error appropriately", async () => {
    nock("https://fail.me")
      .get("/foo")
      .replyWithError("Some error message.");

    try {
      await axios.get("https://fail.me/foo");
    } catch (error) {
      const actualErrorResult = ApiUtil.handleApiResultError(
        "https://fail.me/foo",
        "query",
        undefined,
        error,
      );
      const expectedErrorResult: ApiResultObject<unknown> = {
        data: undefined,
        endpoint: "https://fail.me/foo",
        method: "query",
        record: undefined,
        success: false,
        error: ["Some error message."],
      };
      // eslint-disable-next-line jest/no-try-expect
      expect(actualErrorResult).toEqual(expectedErrorResult);
    }

    expect(nock.isDone()).toBe(true);
  });

  it("handles a non Axios error appropriately", () => {
    const error = new Error("Some random error.");
    const actualErrorResult = ApiUtil.handleApiResultError(
      "https://fail.me/foo",
      "query",
      undefined,
      error,
    );
    const expectedErrorResult: ApiResultObject<unknown> = {
      data: undefined,
      endpoint: "https://fail.me/foo",
      method: "query",
      record: undefined,
      success: false,
      error: ["Some random error."],
    };
    // eslint-disable-next-line jest/no-try-expect
    expect(actualErrorResult).toEqual(expectedErrorResult);
  });
});
