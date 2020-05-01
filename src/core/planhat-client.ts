import axios, { AxiosRequestConfig } from "axios";
import {
  IPlanhatContact,
  IPlanhatCompany,
  IPlanhatEvent,
  PlanhatUser,
  PlanhatLicense,
} from "./planhat-objects";
import ApiResultObject from "../types/api-result";
import IPlanhatClientConfig from "../types/planhat-client-config";
import { ApiUtil } from "../utils/api-util";

class PlanhatClient {
  private apiBaseUrl: string;

  private accessToken: string;

  private tenantId: string;

  /**
   * Creates an instance of PlanhatClient.
   * @param {IPlanhatClientConfig} config The configuration to establish connections.
   * @memberof PlanhatClient
   */
  constructor(config: IPlanhatClientConfig) {
    this.apiBaseUrl = `https://${config.apiPrefix}.planhat.com`;
    this.accessToken = config.accessToken;
    this.tenantId = config.tenantId;
  }

  /**
   * Finds a Planhat contact by email address.
   *
   * @param {string} email The email address of the contact.
   * @returns {Promise<ApiResultObject<IPlanhatContact>>}
   * @memberof PlanhatClient
   */
  public async findContactByEmail(
    email: string,
  ): Promise<ApiResultObject<IPlanhatContact>> {
    const url = `${this.apiBaseUrl}/endusers?email=${email}`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.get(url, axiosConfig);

      const apiResult: ApiResultObject<IPlanhatContact> = {
        data: axiosResponse.data,
        endpoint: url,
        error:
          axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
        method: "query",
        record: undefined,
        success: axiosResponse.status < 400,
      };

      return apiResult;
    } catch (error) {
      return ApiUtil.handleApiResultError<IPlanhatContact>(
        url,
        "query",
        undefined,
        error,
      );
    }
  }

  /**
   * Creates a new contact in Planhat.
   *
   * @param {IPlanhatContact} data The data about the contact.
   * @returns {Promise<ApiResultObject<IPlanhatContact>>}
   * @memberof PlanhatClient
   */
  public async createContact(
    data: IPlanhatContact,
  ): Promise<ApiResultObject<IPlanhatContact>> {
    const url = `${this.apiBaseUrl}/endusers`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.post(url, data, axiosConfig);

      const apiResult: ApiResultObject<IPlanhatContact> = {
        data: axiosResponse.data,
        endpoint: url,
        error:
          axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
        method: "insert",
        record: data,
        success: axiosResponse.status < 400,
      };

      return apiResult;
    } catch (error) {
      return ApiUtil.handleApiResultError<IPlanhatContact>(
        url,
        "insert",
        data,
        error,
      );
    }
  }

  /**
   * Updates an existing contact in Planhat.
   *
   * @param {IPlanhatContact} data The data about the contact.
   * @returns {Promise<ApiResultObject<IPlanhatContact>>}
   * @memberof PlanhatClient
   */
  public async updateContact(
    data: IPlanhatContact,
  ): Promise<ApiResultObject<IPlanhatContact>> {
    const url = `${this.apiBaseUrl}/endusers/${data.id}`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.put(url, data, axiosConfig);

      const apiResult: ApiResultObject<IPlanhatContact> = {
        data: axiosResponse.data,
        endpoint: url,
        error:
          axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
        method: "update",
        record: data,
        success: axiosResponse.status < 400,
      };

      return apiResult;
    } catch (error) {
      return ApiUtil.handleApiResultError<IPlanhatContact>(
        url,
        "update",
        data,
        error,
      );
    }
  }

  /**
   * Deletes an existing contact in Planhat.
   *
   * @param {string} id The Planhat identifier of the contact.
   * @returns {Promise<ApiResultObject<IPlanhatContact>>}
   * @memberof PlanhatClient
   */
  public async deleteContact(
    id: string,
  ): Promise<ApiResultObject<IPlanhatContact>> {
    const url = `${this.apiBaseUrl}/endusers/${id}`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.delete(url, axiosConfig);

      const apiResult: ApiResultObject<IPlanhatContact> = {
        data: axiosResponse.data,
        endpoint: url,
        error:
          axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
        method: "delete",
        record: undefined,
        success: axiosResponse.status < 400,
      };

      return apiResult;
    } catch (error) {
      return ApiUtil.handleApiResultError<IPlanhatContact>(
        url,
        "delete",
        undefined,
        error,
      );
    }
  }

  /**
   * Gets the list of endusers in Planhat using the provided pagination info.
   *
   * @param {number} offset The offset for pagination.
   * @param {number} limit The limit for pagination.
   * @returns {Promise<ApiResultObject<IPlanhatContact>>} The API result object.
   * @memberof PlanhatClient
   */
  public async listEndusers(
    offset: number,
    limit: number,
  ): Promise<ApiResultObject<IPlanhatContact>> {
    const url = `${this.apiBaseUrl}/endusers?limit=${limit}&offset=${offset}`;
    const axiosConfig = this.getAxiosConfig();

    try {
      const axiosResponse = await axios.get(url, axiosConfig);

      const apiResult: ApiResultObject<IPlanhatContact> = {
        data: axiosResponse.data,
        endpoint: url,
        error:
          axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
        method: "query",
        record: undefined,
        success: axiosResponse.status < 400,
      };

      return apiResult;
    } catch (error) {
      return ApiUtil.handleApiResultError<IPlanhatContact>(
        url,
        "query",
        undefined,
        error,
      );
    }
  }

  /**
   * Gets a Planhat company by the internal identifier.
   *
   * @param {string} id The Planhat identifier.
   * @returns {Promise<ApiResultObject<IPlanhatCompany>>}
   * @memberof PlanhatClient
   */
  public async getCompanyById(
    id: string,
  ): Promise<ApiResultObject<IPlanhatCompany>> {
    const url = `${this.apiBaseUrl}/companies/${id}`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.get(url, axiosConfig);

      const apiResult: ApiResultObject<IPlanhatCompany> = {
        data: axiosResponse.data,
        endpoint: url,
        error:
          axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
        method: "query",
        record: undefined,
        success: axiosResponse.status < 400,
      };

      return apiResult;
    } catch (error) {
      return ApiUtil.handleApiResultError<IPlanhatCompany>(
        url,
        "query",
        undefined,
        error,
      );
    }
  }

  /**
   * Finds a Planhat company by external ID.
   *
   * @param {string} externalId The external ID of the company.
   * @returns {Promise<ApiResultObject<IPlanhatCompany>>}
   * @memberof PlanhatClient
   */
  public async findCompanyByExternalId(
    externalId: string,
  ): Promise<ApiResultObject<IPlanhatCompany>> {
    const url = `${this.apiBaseUrl}/leancompanies?externalId=${externalId}`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.get(url, axiosConfig);

      const apiResult: ApiResultObject<IPlanhatCompany> = {
        data: axiosResponse.data,
        endpoint: url,
        error:
          axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
        method: "query",
        record: undefined,
        success: axiosResponse.status < 400,
      };

      return apiResult;
    } catch (error) {
      return ApiUtil.handleApiResultError<IPlanhatCompany>(
        url,
        "query",
        undefined,
        error,
      );
    }
  }

  /**
   * Creates a new company in Planhat.
   *
   * @param {IPlanhatCompany} data The data about the company.
   * @returns {Promise<ApiResultObject<IPlanhatCompany>>}
   * @memberof PlanhatClient
   */
  public async createCompany(
    data: IPlanhatCompany,
  ): Promise<ApiResultObject<IPlanhatCompany>> {
    const url = `${this.apiBaseUrl}/companies`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.post(url, data, axiosConfig);

      const apiResult: ApiResultObject<IPlanhatCompany> = {
        data: axiosResponse.data,
        endpoint: url,
        error:
          axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
        method: "insert",
        record: data,
        success: axiosResponse.status < 400,
      };

      return apiResult;
    } catch (error) {
      return ApiUtil.handleApiResultError<IPlanhatCompany>(
        url,
        "insert",
        data,
        error,
      );
    }
  }

  /**
   * Updates an existing company in Planhat.
   *
   * @param {IPlanhatCompany} data The data about the company.
   * @returns {Promise<ApiResultObject<IPlanhatCompany>>}
   * @memberof PlanhatClient
   */
  public async updateCompany(
    data: IPlanhatCompany,
  ): Promise<ApiResultObject<IPlanhatCompany>> {
    const url = `${this.apiBaseUrl}/companies/${data.id}`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.put(url, data, axiosConfig);

      const apiResult: ApiResultObject<IPlanhatCompany> = {
        data: axiosResponse.data,
        endpoint: url,
        error:
          axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
        method: "update",
        record: data,
        success: axiosResponse.status < 400,
      };

      return apiResult;
    } catch (error) {
      return ApiUtil.handleApiResultError<IPlanhatCompany>(
        url,
        "update",
        data,
        error,
      );
    }
  }

  /**
   * Deletes an existing company in Planhat
   *
   * @param {string} id The Planhat identifier of the company.
   * @returns {Promise<ApiResultObject<IPlanhatCompany>>}
   * @memberof PlanhatClient
   */
  public async deleteCompany(
    id: string,
  ): Promise<ApiResultObject<IPlanhatCompany>> {
    const url = `${this.apiBaseUrl}/companies/${id}`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.delete(url, axiosConfig);

      const apiResult: ApiResultObject<IPlanhatCompany> = {
        data: axiosResponse.data,
        endpoint: url,
        error:
          axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
        method: "delete",
        record: undefined,
        success: axiosResponse.status < 400,
      };

      return apiResult;
    } catch (error) {
      return ApiUtil.handleApiResultError<IPlanhatCompany>(
        url,
        "delete",
        undefined,
        error,
      );
    }
  }

  /**
   * Gets a list of companies in Planhat using the provided pagination info.
   *
   * @param {number} offset The offset for pagination.
   * @param {number} limit The limit for pagination.
   * @returns {Promise<ApiResultObject<IPlanhatCompany>>} An API result object.
   * @memberof PlanhatClient
   */
  public async listCompanies(
    offset: number,
    limit: number,
  ): Promise<ApiResultObject<IPlanhatCompany>> {
    const url = `${this.apiBaseUrl}/companies?limit=${limit}&offset=${offset}`;
    const axiosConfig = this.getAxiosConfig();

    try {
      const axiosResponse = await axios.get(url, axiosConfig);

      const apiResult: ApiResultObject<IPlanhatCompany> = {
        data: axiosResponse.data,
        endpoint: url,
        error:
          axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
        method: "query",
        record: undefined,
        success: axiosResponse.status < 400,
      };

      return apiResult;
    } catch (error) {
      return ApiUtil.handleApiResultError<IPlanhatCompany>(
        url,
        "query",
        undefined,
        error,
      );
    }
  }

  /**
   * Tracks an event in Planhat
   *
   * @param {IPlanhatEvent} data The data about the event.
   * @returns {Promise<ApiResultObject<IPlanhatEvent>>}
   * @memberof PlanhatClient
   */
  public async trackEvent(
    data: IPlanhatEvent,
  ): Promise<ApiResultObject<IPlanhatEvent>> {
    const url = `https://analytics.planhat.com/analytics/${this.tenantId}`;
    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.post(url, data, axiosConfig);

      const apiResult: ApiResultObject<IPlanhatEvent> = {
        data: axiosResponse.data,
        endpoint: url,
        error:
          axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
        method: "insert",
        record: data,
        success: axiosResponse.status < 400,
      };

      return apiResult;
    } catch (error) {
      return ApiUtil.handleApiResultError<IPlanhatEvent>(
        url,
        "insert",
        data,
        error,
      );
    }
  }

  /**
   * Lists all users of the Planhat App
   *
   * @returns {Promise<ApiResultObject<PlanhatUser>>} The API result with the array of users.
   * @memberof PlanhatClient
   */
  public async listUsers(): Promise<ApiResultObject<PlanhatUser>> {
    const url = `${this.apiBaseUrl}/users`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.get(url, axiosConfig);

      const apiResult: ApiResultObject<PlanhatUser> = {
        data: axiosResponse.data,
        endpoint: url,
        error:
          axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
        method: "query",
        record: undefined,
        success: axiosResponse.status < 400,
      };

      return apiResult;
    } catch (error) {
      return ApiUtil.handleApiResultError<PlanhatUser>(
        url,
        "query",
        undefined,
        error,
      );
    }
  }

  /**
   * Gets a user by the specified identifier.
   *
   * @param {string} id The Planhat ID of the user
   * @returns {Promise<ApiResultObject<PlanhatUser>>} The API result containing the user data.
   * @memberof PlanhatClient
   */
  public async getUserById(id: string): Promise<ApiResultObject<PlanhatUser>> {
    const url = `${this.apiBaseUrl}/users/${id}`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.get(url, axiosConfig);

      const apiResult: ApiResultObject<PlanhatUser> = {
        data: axiosResponse.data,
        endpoint: url,
        error:
          axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
        method: "query",
        record: undefined,
        success: axiosResponse.status < 400,
      };

      return apiResult;
    } catch (error) {
      return ApiUtil.handleApiResultError<PlanhatUser>(
        url,
        "query",
        undefined,
        error,
      );
    }
  }

  /**
   * Create a new user with the provided parameters.
   *
   * @param {PlanhatUser} data The information about the user to create.
   * @returns {Promise<ApiResultObject<PlanhatUser>>} The API result containing data about the user creation.
   * @memberof PlanhatClient
   */
  public async createUser(
    data: PlanhatUser,
  ): Promise<ApiResultObject<PlanhatUser>> {
    const url = `${this.apiBaseUrl}/users`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.post(url, data, axiosConfig);

      const apiResult: ApiResultObject<PlanhatUser> = {
        data: axiosResponse.data,
        endpoint: url,
        error:
          axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
        method: "insert",
        record: data,
        success: axiosResponse.status < 400,
      };

      return apiResult;
    } catch (error) {
      return ApiUtil.handleApiResultError<PlanhatUser>(
        url,
        "insert",
        data,
        error,
      );
    }
  }

  public async updateUser(
    id: string,
    data: PlanhatUser,
  ): Promise<ApiResultObject<PlanhatUser>> {
    const url = `${this.apiBaseUrl}/users/${id}`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.put(url, data, axiosConfig);

      const apiResult: ApiResultObject<PlanhatUser> = {
        data: axiosResponse.data,
        endpoint: url,
        error:
          axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
        method: "update",
        record: data,
        success: axiosResponse.status < 400,
      };

      return apiResult;
    } catch (error) {
      return ApiUtil.handleApiResultError<PlanhatUser>(
        url,
        "update",
        data,
        error,
      );
    }
  }

  /**
   * Gets a license by the specified identifier.
   *
   * @param {string} companyId The Planhat ID of the company
   * @param {string} id The Planhat ID of the license
   * @returns {Promise<ApiResultObject<PlanhatLicense>>} The API result containing the license data.
   * @memberof PlanhatClient
   */
  public async getLicenseById(
    companyId: string,
    id: string,
  ): Promise<ApiResultObject<PlanhatLicense>> {
    const url = `${this.apiBaseUrl}/companies/${companyId}/licenses/${id}`;
    const axiosConfig = this.getAxiosConfig();

    try {
      const axiosResponse = await axios.get(url, axiosConfig);
      return ApiUtil.handleApiResultSuccess<PlanhatLicense>(
        url,
        "query",
        undefined,
        axiosResponse,
      );
    } catch (error) {
      return ApiUtil.handleApiResultError<PlanhatLicense>(
        url,
        "query",
        undefined,
        error,
      );
    }
  }

  public async createLicense(
    companyId: string,
    data: PlanhatLicense,
  ): Promise<ApiResultObject<PlanhatLicense>> {
    const url = `${this.apiBaseUrl}/companies/${companyId}/licenses`;
    const axiosConfig = this.getAxiosConfig();

    try {
      const axiosResponse = await axios.post(url, data, axiosConfig);
      return ApiUtil.handleApiResultSuccess<PlanhatLicense>(
        url,
        "insert",
        data,
        axiosResponse,
      );
    } catch (error) {
      return ApiUtil.handleApiResultError<PlanhatLicense>(
        url,
        "insert",
        data,
        error,
      );
    }
  }

  public async updateLicense(
    companyId: string,
    id: string,
    data: PlanhatLicense,
  ): Promise<ApiResultObject<PlanhatLicense>> {
    const url = `${this.apiBaseUrl}/companies/${companyId}/licenses/${id}`;
    const axiosConfig = this.getAxiosConfig();

    try {
      const axiosResponse = await axios.put(url, data, axiosConfig);
      return ApiUtil.handleApiResultSuccess<PlanhatLicense>(
        url,
        "update",
        data,
        axiosResponse,
      );
    } catch (error) {
      return ApiUtil.handleApiResultError<PlanhatLicense>(
        url,
        "update",
        data,
        error,
      );
    }
  }

  public async bulkUpsertLicenses(
    data: PlanhatLicense[],
  ): Promise<ApiResultObject<Array<PlanhatLicense>>> {
    const url = `${this.apiBaseUrl}/licenses`;
    const axiosConfig = this.getAxiosConfig();

    try {
      const axiosResponse = await axios.put(url, data, axiosConfig);
      return ApiUtil.handleApiResultSuccess<Array<PlanhatLicense>>(
        url,
        "bulkUpsert",
        data,
        axiosResponse,
      );
    } catch (error) {
      return ApiUtil.handleApiResultError<Array<PlanhatLicense>>(
        url,
        "bulkUpsert",
        data,
        error,
      );
    }
  }

  public async deleteLicense(
    companyId: string,
    id: string,
  ): Promise<ApiResultObject<PlanhatLicense>> {
    const url = `${this.apiBaseUrl}/companies/${companyId}/licenses/${id}`;
    const axiosConfig = this.getAxiosConfig();

    try {
      const axiosResponse = await axios.delete(url, axiosConfig);
      return ApiUtil.handleApiResultSuccess<PlanhatLicense>(
        url,
        "delete",
        undefined,
        axiosResponse,
      );
    } catch (error) {
      return ApiUtil.handleApiResultError<PlanhatLicense>(
        url,
        "delete",
        undefined,
        error,
      );
    }
  }

  private getAxiosConfig(): AxiosRequestConfig {
    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    return axiosConfig;
  }
}

// eslint-disable-next-line import/no-default-export
export default PlanhatClient;
