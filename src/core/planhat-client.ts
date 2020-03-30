import axios, { AxiosRequestConfig, AxiosError } from "axios";
import {
  IPlanhatContact,
  IPlanhatCompany,
  IPlanhatEvent,
  PlanhatUser,
} from "./planhat-objects";
import IApiResultObject from "../types/api-result";
import IPlanhatClientConfig from "../types/planhat-client-config";

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
   * @returns {Promise<IApiResultObject<IPlanhatContact>>}
   * @memberof PlanhatClient
   */
  public async findContactByEmail(
    email: string,
  ): Promise<IApiResultObject<IPlanhatContact>> {
    const url = `${this.apiBaseUrl}/endusers?email=${email}`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.get(url, axiosConfig);

      const apiResult: IApiResultObject<IPlanhatContact> = {
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
      const axiosResponse = (error as AxiosError).response;

      const apiResult: IApiResultObject<IPlanhatContact> = {
        data: undefined,
        endpoint: url,
        error: (error as AxiosError).message,
        method: "query",
        record: undefined,
        success: false,
      };

      if (axiosResponse !== undefined) {
        apiResult.data = axiosResponse.data;
        apiResult.error = [
          (error as AxiosError).message,
          axiosResponse.statusText,
        ];
      }

      return apiResult;
    }
  }

  /**
   * Creates a new contact in Planhat.
   *
   * @param {IPlanhatContact} data The data about the contact.
   * @returns {Promise<IApiResultObject<IPlanhatContact>>}
   * @memberof PlanhatClient
   */
  public async createContact(
    data: IPlanhatContact,
  ): Promise<IApiResultObject<IPlanhatContact>> {
    const url = `${this.apiBaseUrl}/endusers`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.post(url, data, axiosConfig);

      const apiResult: IApiResultObject<IPlanhatContact> = {
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
      const axiosResponse = (error as AxiosError).response;

      const apiResult: IApiResultObject<IPlanhatContact> = {
        data: undefined,
        endpoint: url,
        error: (error as AxiosError).message,
        method: "insert",
        record: data,
        success: false,
      };

      if (axiosResponse !== undefined) {
        apiResult.data = axiosResponse.data;
        apiResult.error = [
          (error as AxiosError).message,
          axiosResponse.statusText,
        ];
      }

      return apiResult;
    }
  }

  /**
   * Updates an existing contact in Planhat.
   *
   * @param {IPlanhatContact} data The data about the contact.
   * @returns {Promise<IApiResultObject<IPlanhatContact>>}
   * @memberof PlanhatClient
   */
  public async updateContact(
    data: IPlanhatContact,
  ): Promise<IApiResultObject<IPlanhatContact>> {
    const url = `${this.apiBaseUrl}/endusers/${data.id}`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.put(url, data, axiosConfig);

      const apiResult: IApiResultObject<IPlanhatContact> = {
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
      const axiosResponse = (error as AxiosError).response;

      const apiResult: IApiResultObject<IPlanhatContact> = {
        data: undefined,
        endpoint: url,
        error: (error as AxiosError).message,
        method: "update",
        record: data,
        success: false,
      };

      if (axiosResponse !== undefined) {
        apiResult.data = axiosResponse.data;
        apiResult.error = [
          (error as AxiosError).message,
          axiosResponse.statusText,
        ];
      }

      return apiResult;
    }
  }

  /**
   * Deletes an existing contact in Planhat.
   *
   * @param {string} id The Planhat identifier of the contact.
   * @returns {Promise<IApiResultObject<IPlanhatContact>>}
   * @memberof PlanhatClient
   */
  public async deleteContact(
    id: string,
  ): Promise<IApiResultObject<IPlanhatContact>> {
    const url = `${this.apiBaseUrl}/endusers/${id}`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.delete(url, axiosConfig);

      const apiResult: IApiResultObject<IPlanhatContact> = {
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
      const axiosResponse = (error as AxiosError).response;

      const apiResult: IApiResultObject<IPlanhatContact> = {
        data: undefined,
        endpoint: url,
        error: (error as AxiosError).message,
        method: "delete",
        record: undefined,
        success: false,
      };

      if (axiosResponse !== undefined) {
        apiResult.data = axiosResponse.data;
        apiResult.error = [
          (error as AxiosError).message,
          axiosResponse.statusText,
        ];
      }

      return apiResult;
    }
  }

  /**
   * Gets a Planhat company by the internal identifier.
   *
   * @param {string} id The Planhat identifier.
   * @returns {Promise<IApiResultObject<IPlanhatCompany>>}
   * @memberof PlanhatClient
   */
  public async getCompanyById(
    id: string,
  ): Promise<IApiResultObject<IPlanhatCompany>> {
    const url = `${this.apiBaseUrl}/companies/${id}`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.get(url, axiosConfig);

      const apiResult: IApiResultObject<IPlanhatCompany> = {
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
      const axiosResponse = (error as AxiosError).response;

      const apiResult: IApiResultObject<IPlanhatCompany> = {
        data: undefined,
        endpoint: url,
        error: (error as AxiosError).message,
        method: "query",
        record: undefined,
        success: false,
      };

      if (axiosResponse !== undefined) {
        apiResult.data = axiosResponse.data;
        apiResult.error = [
          (error as AxiosError).message,
          axiosResponse.statusText,
        ];
      }

      return apiResult;
    }
  }

  /**
   * Finds a Planhat company by external ID.
   *
   * @param {string} externalId The external ID of the company.
   * @returns {Promise<IApiResultObject<IPlanhatCompany>>}
   * @memberof PlanhatClient
   */
  public async findCompanyByExternalId(
    externalId: string,
  ): Promise<IApiResultObject<IPlanhatCompany>> {
    const url = `${this.apiBaseUrl}/leancompanies?externalId=${externalId}`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.get(url, axiosConfig);

      const apiResult: IApiResultObject<IPlanhatCompany> = {
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
      const axiosResponse = (error as AxiosError).response;

      const apiResult: IApiResultObject<IPlanhatCompany> = {
        data: undefined,
        endpoint: url,
        error: (error as AxiosError).message,
        method: "query",
        record: undefined,
        success: false,
      };

      if (axiosResponse !== undefined) {
        apiResult.data = axiosResponse.data;
        apiResult.error = [
          (error as AxiosError).message,
          axiosResponse.statusText,
        ];
      }

      return apiResult;
    }
  }

  /**
   * Creates a new company in Planhat.
   *
   * @param {IPlanhatCompany} data The data about the company.
   * @returns {Promise<IApiResultObject<IPlanhatCompany>>}
   * @memberof PlanhatClient
   */
  public async createCompany(
    data: IPlanhatCompany,
  ): Promise<IApiResultObject<IPlanhatCompany>> {
    const url = `${this.apiBaseUrl}/companies`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.post(url, data, axiosConfig);

      const apiResult: IApiResultObject<IPlanhatCompany> = {
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
      const axiosResponse = (error as AxiosError).response;

      const apiResult: IApiResultObject<IPlanhatCompany> = {
        data: undefined,
        endpoint: url,
        error: (error as AxiosError).message,
        method: "insert",
        record: data,
        success: false,
      };

      if (axiosResponse !== undefined) {
        apiResult.data = axiosResponse.data;
        apiResult.error = [
          (error as AxiosError).message,
          axiosResponse.statusText,
        ];
      }

      return apiResult;
    }
  }

  /**
   * Updates an existing company in Planhat.
   *
   * @param {IPlanhatCompany} data The data about the company.
   * @returns {Promise<IApiResultObject<IPlanhatCompany>>}
   * @memberof PlanhatClient
   */
  public async updateCompany(
    data: IPlanhatCompany,
  ): Promise<IApiResultObject<IPlanhatCompany>> {
    const url = `${this.apiBaseUrl}/companies/${data.id}`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.put(url, data, axiosConfig);

      const apiResult: IApiResultObject<IPlanhatCompany> = {
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
      const axiosResponse = (error as AxiosError).response;

      const apiResult: IApiResultObject<IPlanhatCompany> = {
        data: undefined,
        endpoint: url,
        error: (error as AxiosError).message,
        method: "update",
        record: data,
        success: false,
      };

      if (axiosResponse !== undefined) {
        apiResult.data = axiosResponse.data;
        apiResult.error = [
          (error as AxiosError).message,
          axiosResponse.statusText,
        ];
      }

      return apiResult;
    }
  }

  /**
   * Deletes an existing company in Planhat
   *
   * @param {string} id The Planhat identifier of the company.
   * @returns {Promise<IApiResultObject<IPlanhatCompany>>}
   * @memberof PlanhatClient
   */
  public async deleteCompany(
    id: string,
  ): Promise<IApiResultObject<IPlanhatCompany>> {
    const url = `${this.apiBaseUrl}/companies/${id}`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.delete(url, axiosConfig);

      const apiResult: IApiResultObject<IPlanhatCompany> = {
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
      const axiosResponse = (error as AxiosError).response;

      const apiResult: IApiResultObject<IPlanhatCompany> = {
        data: undefined,
        endpoint: url,
        error: (error as AxiosError).message,
        method: "delete",
        record: undefined,
        success: false,
      };

      if (axiosResponse !== undefined) {
        apiResult.data = axiosResponse.data;
        apiResult.error = [
          (error as AxiosError).message,
          axiosResponse.statusText,
        ];
      }

      return apiResult;
    }
  }

  /**
   * Tracks an event in Planhat
   *
   * @param {IPlanhatEvent} data The data about the event.
   * @returns {Promise<IApiResultObject<IPlanhatEvent>>}
   * @memberof PlanhatClient
   */
  public async trackEvent(
    data: IPlanhatEvent,
  ): Promise<IApiResultObject<IPlanhatEvent>> {
    const url = `https://analytics.planhat.com/analytics/${this.tenantId}`;
    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.post(url, data, axiosConfig);

      const apiResult: IApiResultObject<IPlanhatEvent> = {
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
      const axiosResponse = (error as AxiosError).response;

      const apiResult: IApiResultObject<IPlanhatEvent> = {
        data: undefined,
        endpoint: url,
        error: (error as AxiosError).message,
        method: "insert",
        record: data,
        success: false,
      };

      if (axiosResponse !== undefined) {
        apiResult.data = axiosResponse.data;
        apiResult.error = [
          (error as AxiosError).message,
          axiosResponse.statusText,
        ];
      }

      return apiResult;
    }
  }

  /**
   * Lists all users of the Planhat App
   *
   * @returns {Promise<IApiResultObject<PlanhatUser>>} The API result with the array of users.
   * @memberof PlanhatClient
   */
  public async listUsers(): Promise<IApiResultObject<PlanhatUser>> {
    const url = `${this.apiBaseUrl}/users`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.get(url, axiosConfig);

      const apiResult: IApiResultObject<PlanhatUser> = {
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
      const axiosResponse = (error as AxiosError).response;

      const apiResult: IApiResultObject<PlanhatUser> = {
        data: undefined,
        endpoint: url,
        error: (error as AxiosError).message,
        method: "query",
        record: undefined,
        success: false,
      };

      if (axiosResponse !== undefined) {
        apiResult.data = axiosResponse.data;
        apiResult.error = [
          (error as AxiosError).message,
          axiosResponse.statusText,
        ];
      }

      return apiResult;
    }
  }

  /**
   * Gets a user by the specified identifier.
   *
   * @param {string} id The Planhat ID of the user
   * @returns {Promise<IApiResultObject<PlanhatUser>>} The API result containing the user data.
   * @memberof PlanhatClient
   */
  public async getUserById(id: string): Promise<IApiResultObject<PlanhatUser>> {
    const url = `${this.apiBaseUrl}/users/${id}`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.get(url, axiosConfig);

      const apiResult: IApiResultObject<PlanhatUser> = {
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
      const axiosResponse = (error as AxiosError).response;

      const apiResult: IApiResultObject<PlanhatUser> = {
        data: undefined,
        endpoint: url,
        error: (error as AxiosError).message,
        method: "query",
        record: undefined,
        success: false,
      };

      if (axiosResponse !== undefined) {
        apiResult.data = axiosResponse.data;
        apiResult.error = [
          (error as AxiosError).message,
          axiosResponse.statusText,
        ];
      }

      return apiResult;
    }
  }

  /**
   * Create a new user with the provided parameters.
   *
   * @param {PlanhatUser} data The information about the user to create.
   * @returns {Promise<IApiResultObject<PlanhatUser>>} The API result containing data about the user creation.
   * @memberof PlanhatClient
   */
  public async createUser(
    data: PlanhatUser,
  ): Promise<IApiResultObject<PlanhatUser>> {
    const url = `${this.apiBaseUrl}/users`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.post(url, data, axiosConfig);

      const apiResult: IApiResultObject<PlanhatUser> = {
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
      const axiosResponse = (error as AxiosError).response;

      const apiResult: IApiResultObject<PlanhatUser> = {
        data: undefined,
        endpoint: url,
        error: (error as AxiosError).message,
        method: "insert",
        record: data,
        success: false,
      };

      if (axiosResponse !== undefined) {
        apiResult.data = axiosResponse.data;
        apiResult.error = [
          (error as AxiosError).message,
          axiosResponse.statusText,
        ];
      }

      return apiResult;
    }
  }

  public async updateUser(
    id: string,
    data: PlanhatUser,
  ): Promise<IApiResultObject<PlanhatUser>> {
    const url = `${this.apiBaseUrl}/users/${id}`;

    const axiosConfig: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      responseType: "json",
    };

    try {
      const axiosResponse = await axios.put(url, data, axiosConfig);

      const apiResult: IApiResultObject<PlanhatUser> = {
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
      const axiosResponse = (error as AxiosError).response;

      const apiResult: IApiResultObject<PlanhatUser> = {
        data: undefined,
        endpoint: url,
        error: (error as AxiosError).message,
        method: "update",
        record: data,
        success: false,
      };

      if (axiosResponse !== undefined) {
        apiResult.data = axiosResponse.data;
        apiResult.error = [
          (error as AxiosError).message,
          axiosResponse.statusText,
        ];
      }

      return apiResult;
    }
  }
}

// eslint-disable-next-line import/no-default-export
export default PlanhatClient;
