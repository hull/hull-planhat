import _ from "lodash";
import { AxiosError, AxiosResponse } from "axios";
import ApiResultObject, { ApiMethod } from "../types/api-result";

export class ApiUtil {
  /**
   * Handles errors of an API operation and creates an appropriate result.
   *
   * @static
   * @template T The type of data.
   * @param {string} url The url of the API endpoint
   * @param {ApiMethod} method The API method.
   * @param {*} payload The payload data with which the API endpoint has been invoked.
   * @param {*} error The error thrown by the invocation of the API.
   * @returns {ApiResultObject<T>} An API result with the properly formatted error messages.
   * @memberof ErrorUtil
   */
  public static handleApiResultError<T>(
    url: string,
    method: ApiMethod,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any,
  ): ApiResultObject<T> {
    const axiosResponse = (error as AxiosError).response;

    const apiResult: ApiResultObject<T> = {
      data: undefined,
      endpoint: url,
      error: [(error as AxiosError).message],
      method,
      record: payload,
      success: false,
    };

    if (axiosResponse !== undefined || error.isAxiosError === true) {
      apiResult.data = axiosResponse ? axiosResponse.data : undefined;
      apiResult.error = _.compact([
        (error as AxiosError).message,
        axiosResponse ? axiosResponse.statusText : null,
      ]);
    }

    return apiResult;
  }

  /**
   * Creates a properly composed API result object based on the axios response.
   *
   * @static
   * @template T The type of data.
   * @param {string} url The url of the API endpoint
   * @param {ApiMethod} method The API method.
   * @param {*} payload The payload data with which the API endpoint has been invoked.
   * @param {AxiosResponse} axiosResponse The response returned from Axios.
   * @returns {ApiResultObject<T>} A properly composed API result object.
   * @memberof ApiUtil
   */
  public static handleApiResultSuccess<T>(
    url: string,
    method: ApiMethod,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any,
    axiosResponse: AxiosResponse,
  ): ApiResultObject<T> {
    const apiResult: ApiResultObject<T> = {
      data: axiosResponse.data,
      endpoint: url,
      error: axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
      method,
      record: payload,
      success: axiosResponse.status < 400,
    };

    return apiResult;
  }
}
