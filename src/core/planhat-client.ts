import axios, { AxiosRequestConfig, AxiosError } from "axios";
import { IPlanhatContact, IPlanhatCompany, IPlanhatEvent } from "./planhat-objects";
import IApiResultObject from "../types/api-result";
import IPlanhatClientConfig from "../types/planhat-client-config";

class PlanhatClient {
    private _apiBaseUrl: string;
    private _accessToken: string;
    private _tenantId: string;

    /**
     * Creates an instance of PlanhatClient.
     * @param {IPlanhatClientConfig} config The configuration to establish connections.
     * @memberof PlanhatClient
     */
    constructor(config: IPlanhatClientConfig) {
        this._apiBaseUrl = `https://${config.apiPrefix}.planhat.com`;
        this._accessToken = config.accessToken;
        this._tenantId = config.tenantId;
    }

    /**
     * Finds a Planhat contact by email address.
     *
     * @param {string} email The email address of the contact.
     * @returns {Promise<IApiResultObject<IPlanhatContact>>}
     * @memberof PlanhatClient
     */
    public async findContactByEmail(email: string): Promise<IApiResultObject<IPlanhatContact>> {
        const url = `${this._apiBaseUrl}/endusers?email=${email}`;
        
        const axiosConfig: AxiosRequestConfig = {
            headers: {
                Authorization: `Bearer ${this._accessToken}`
            },
            responseType: "json"
        }

        try {
            const axiosResponse = await axios.get(url, axiosConfig);
        
            const apiResult: IApiResultObject<IPlanhatContact> = {
                data: axiosResponse.data,
                endpoint: url,
                error: axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
                method: "query",
                record: undefined,
                success: axiosResponse.status < 400
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
                success: false
            };

            if (axiosResponse !== undefined) {
                apiResult.data = axiosResponse.data;
                apiResult.error = [ (error as AxiosError).message, axiosResponse.statusText]
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
    public async createContact(data: IPlanhatContact): Promise<IApiResultObject<IPlanhatContact>> {
        const url = `${this._apiBaseUrl}/endusers`;
        
        const axiosConfig: AxiosRequestConfig = {
            headers: {
                Authorization: `Bearer ${this._accessToken}`
            },
            responseType: "json"
        }

        try {
            const axiosResponse = await axios.post(url, data, axiosConfig);
        
            const apiResult: IApiResultObject<IPlanhatContact> = {
                data: axiosResponse.data,
                endpoint: url,
                error: axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
                method: "insert",
                record: data,
                success: axiosResponse.status < 400
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
                success: false
            };

            
            if (axiosResponse !== undefined) {
                apiResult.data = axiosResponse.data;
                apiResult.error = [ (error as AxiosError).message, axiosResponse.statusText]
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
    public async updateContact(data: IPlanhatContact): Promise<IApiResultObject<IPlanhatContact>> {
        const url = `${this._apiBaseUrl}/endusers/${data.id}`;
        
        const axiosConfig: AxiosRequestConfig = {
            headers: {
                Authorization: `Bearer ${this._accessToken}`
            },
            responseType: "json"
        }

        try {
            const axiosResponse = await axios.put(url, data, axiosConfig);
        
            const apiResult: IApiResultObject<IPlanhatContact> = {
                data: axiosResponse.data,
                endpoint: url,
                error: axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
                method: "update",
                record: data,
                success: axiosResponse.status < 400
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
                success: false
            };

            if (axiosResponse !== undefined) {
                apiResult.data = axiosResponse.data;
                apiResult.error = [ (error as AxiosError).message, axiosResponse.statusText]
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
    public async deleteContact(id: string): Promise<IApiResultObject<IPlanhatContact>> {
        const url = `${this._apiBaseUrl}/endusers/${id}`;
        
        const axiosConfig: AxiosRequestConfig = {
            headers: {
                Authorization: `Bearer ${this._accessToken}`
            },
            responseType: "json"
        }

        try {
            const axiosResponse = await axios.delete(url, axiosConfig);
        
            const apiResult: IApiResultObject<IPlanhatContact> = {
                data: axiosResponse.data,
                endpoint: url,
                error: axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
                method: "delete",
                record: undefined,
                success: axiosResponse.status < 400
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
                success: false
            };

            if (axiosResponse !== undefined) {
                apiResult.data = axiosResponse.data;
                apiResult.error = [ (error as AxiosError).message, axiosResponse.statusText]
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
    public async findCompanyByExternalId(externalId: string): Promise<IApiResultObject<IPlanhatCompany>> {
        const url = `${this._apiBaseUrl}/leancompanies?externalId=${externalId}`;
        
        const axiosConfig: AxiosRequestConfig = {
            headers: {
                Authorization: `Bearer ${this._accessToken}`
            },
            responseType: "json"
        }

        try {
            const axiosResponse = await axios.get(url, axiosConfig);
        
            const apiResult: IApiResultObject<IPlanhatCompany> = {
                data: axiosResponse.data,
                endpoint: url,
                error: axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
                method: "query",
                record: undefined,
                success: axiosResponse.status < 400
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
                success: false
            };

            if (axiosResponse !== undefined) {
                apiResult.data = axiosResponse.data;
                apiResult.error = [ (error as AxiosError).message, axiosResponse.statusText]
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
    public async createCompany(data: IPlanhatCompany): Promise<IApiResultObject<IPlanhatCompany>> {
        const url = `${this._apiBaseUrl}/companies`;
        
        const axiosConfig: AxiosRequestConfig = {
            headers: {
                Authorization: `Bearer ${this._accessToken}`
            },
            responseType: "json"
        }

        try {
            const axiosResponse = await axios.post(url, data, axiosConfig);
        
            const apiResult: IApiResultObject<IPlanhatCompany> = {
                data: axiosResponse.data,
                endpoint: url,
                error: axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
                method: "insert",
                record: data,
                success: axiosResponse.status < 400
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
                success: false
            };

            if (axiosResponse !== undefined) {
                apiResult.data = axiosResponse.data;
                apiResult.error = [ (error as AxiosError).message, axiosResponse.statusText]
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
    public async updateCompany(data: IPlanhatCompany): Promise<IApiResultObject<IPlanhatCompany>> {
        const url = `${this._apiBaseUrl}/companies/${data.id}`;
        
        const axiosConfig: AxiosRequestConfig = {
            headers: {
                Authorization: `Bearer ${this._accessToken}`
            },
            responseType: "json"
        }

        try {
            const axiosResponse = await axios.put(url, data, axiosConfig);
        
            const apiResult: IApiResultObject<IPlanhatCompany> = {
                data: axiosResponse.data,
                endpoint: url,
                error: axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
                method: "update",
                record: data,
                success: axiosResponse.status < 400
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
                success: false
            };

            if (axiosResponse !== undefined) {
                apiResult.data = axiosResponse.data;
                apiResult.error = [ (error as AxiosError).message, axiosResponse.statusText]
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
    public async deleteCompany(id: string): Promise<IApiResultObject<IPlanhatCompany>> {
        const url = `${this._apiBaseUrl}/companies/${id}`;
        
        const axiosConfig: AxiosRequestConfig = {
            headers: {
                Authorization: `Bearer ${this._accessToken}`
            },
            responseType: "json"
        }

        try {
            const axiosResponse = await axios.delete(url, axiosConfig);
        
            const apiResult: IApiResultObject<IPlanhatCompany> = {
                data: axiosResponse.data,
                endpoint: url,
                error: axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
                method: "delete",
                record: undefined,
                success: axiosResponse.status < 400
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
                success: false
            };

            if (axiosResponse !== undefined) {
                apiResult.data = axiosResponse.data;
                apiResult.error = [ (error as AxiosError).message, axiosResponse.statusText]
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
    public async trackEvent(data: IPlanhatEvent): Promise<IApiResultObject<IPlanhatEvent>> {
        const url = `https://analytics.planhat.com/analytics/${this._tenantId}`;
        const axiosConfig: AxiosRequestConfig = {
            headers: {
                Authorization: `Bearer ${this._accessToken}`
            },
            responseType: "json"
        }

        try {
            const axiosResponse = await axios.post(url, data, axiosConfig);
        
            const apiResult: IApiResultObject<IPlanhatEvent> = {
                data: axiosResponse.data,
                endpoint: url,
                error: axiosResponse.status >= 400 ? axiosResponse.statusText : undefined,
                method: "insert",
                record: data,
                success: axiosResponse.status < 400
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
                success: false
            };

            if (axiosResponse !== undefined) {
                apiResult.data = axiosResponse.data;
                apiResult.error = [ (error as AxiosError).message, axiosResponse.statusText]
            }

            return apiResult;
        }
        
    }
}

export default PlanhatClient;