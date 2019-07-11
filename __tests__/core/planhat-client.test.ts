import nock from "nock";
import { IPlanhatContact, IPlanhatCompany, IPlanhatEvent } from "../../src/core/planhat-objects";
import IPlanhatClientConfig from "../../src/types/planhat-client-config";
import PlanhatClient from "../../src/core/planhat-client";
import IApiResultObject from "../../src/types/api-result";

describe('PlanhatClient', () => {
    beforeEach(() => {
        nock.cleanAll();
        nock.restore();

        if (!nock.isActive()) {
            nock.activate()
        }
    });

    afterAll(() => {
        nock.cleanAll();
        nock.restore();
    });

    test('should pass smoke test', () => {
        expect(true).toBeTruthy();
    });

    test('should query an existing contact by email', async() => {
        const email = "test1@hull.io";
        const data: IPlanhatContact = {
            id: "1234",
            companyId: "company1234",
            createDate: new Date().toISOString(),
            email: "test1@hull.io",
            name: "John Smith",
        };

        const svcClientConfig: IPlanhatClientConfig = {
            accessToken: "yp42nhyhAKFLUSg5y4u0w==",
            apiPrefix: "api",
            tenantId: "py3h8hbrn"
        };

        nock('https://api.planhat.com')
            .matchHeader('authorization', `Bearer ${svcClientConfig.accessToken}`)
            .get(`/endusers?email=${email}`)
            .reply(200, data, { 'Content-Type': 'application/json' });
        
        const svcClient = new PlanhatClient(svcClientConfig);
        const actual = await svcClient.findContactByEmail(email);
        const expected: IApiResultObject<IPlanhatContact> = {
            data,
            endpoint: `https://api.planhat.com/endusers?email=${email}`,
            method: "query",
            record: undefined,
            success: true
        };
        expect(actual).toEqual(expected);
    });

    test('should not throw if api return status 500 when querying an existing contact by email', async() => {
        const email = "test1@hull.io";

        const svcClientConfig: IPlanhatClientConfig = {
            accessToken: "yp42nhyhAKFLUSg5y4u0w==",
            apiPrefix: "api",
            tenantId: "py3h8hbrn"
        };

        nock('https://api.planhat.com')
            .matchHeader('authorization', `Bearer ${svcClientConfig.accessToken}`)
            .get(`/endusers?email=${email}`)
            .replyWithError('Some arbitrary error');
        
        const svcClient = new PlanhatClient(svcClientConfig);
        const actual = await svcClient.findContactByEmail(email);
        const expected: IApiResultObject<IPlanhatContact> = {
            data: undefined,
            endpoint: `https://api.planhat.com/endusers?email=${email}`,
            method: "query",
            record: undefined,
            success: false,
            error: 'Some arbitrary error'
        };
        expect(actual).toEqual(expected);
    });

    test('should create a new contact and return success', async () => {
        const data: IPlanhatContact = {
            companyId: "company1234",
            createDate: new Date().toISOString(),
            email: "test1@hull.io",
            name: "John Smith",
        };

        const svcClientConfig: IPlanhatClientConfig = {
            accessToken: "yp42nhyhAKFLUSg5y4u0w==",
            apiPrefix: "api",
            tenantId: "py3h8hbrn"
        };

        nock('https://api.planhat.com')
            .matchHeader('authorization', `Bearer ${svcClientConfig.accessToken}`)
            .post("/endusers")
            .reply(200, data, { 'Content-Type': 'application/json' });
        
        const svcClient = new PlanhatClient(svcClientConfig);
        const actual = await svcClient.createContact(data);
        const expected: IApiResultObject<IPlanhatContact> = {
            data,
            endpoint: 'https://api.planhat.com/endusers',
            method: "insert",
            record: data,
            success: true
        };
        expect(actual).toEqual(expected);
    });

    test('should not throw if api returns status 500 for new contact', async () => {
        const data: IPlanhatContact = {
            companyId: "company1234",
            createDate: new Date().toISOString(),
            email: "test1@hull.io",
            name: "John Smith",
        };

        const svcClientConfig: IPlanhatClientConfig = {
            accessToken: "yp42nhyhAKFLUSg5y4u0w==",
            apiPrefix: "api",
            tenantId: "py3h8hbrn"
        };

        nock('https://api.planhat.com')
            .matchHeader('authorization', `Bearer ${svcClientConfig.accessToken}`)
            .post("/endusers")
            .replyWithError('Some arbitrary error');
        
        const svcClient = new PlanhatClient(svcClientConfig);
        const actual = await svcClient.createContact(data);
        const expected: IApiResultObject<IPlanhatContact> = {
            data: undefined,
            endpoint: 'https://api.planhat.com/endusers',
            method: "insert",
            record: data,
            success: false,
            error: 'Some arbitrary error'
        };
        expect(actual).toEqual(expected);
    });

    test('should update an existing contact and return success', async () => {
        const data: IPlanhatContact = {
            id: "1234",
            companyId: "company1234",
            createDate: new Date().toISOString(),
            email: "test1@hull.io",
            name: "John Smith",
        };

        const svcClientConfig: IPlanhatClientConfig = {
            accessToken: "yp42nhyhAKFLUSg5y4u0w==",
            apiPrefix: "api",
            tenantId: "py3h8hbrn"
        };

        nock('https://api.planhat.com')
            .matchHeader('authorization', `Bearer ${svcClientConfig.accessToken}`)
            .put(`/endusers/${data.id}`)
            .reply(200, data, { 'Content-Type': 'application/json' });
        
        const svcClient = new PlanhatClient(svcClientConfig);
        const actual = await svcClient.updateContact(data);
        const expected: IApiResultObject<IPlanhatContact> = {
            data,
            endpoint: `https://api.planhat.com/endusers/${data.id}`,
            method: "update",
            record: data,
            success: true
        };
        expect(actual).toEqual(expected);
    });

    test('should not throw if api returns status 500 for update contact', async () => {
        const data: IPlanhatContact = {
            id: "1234",
            companyId: "company1234",
            createDate: new Date().toISOString(),
            email: "test1@hull.io",
            name: "John Smith",
        };

        const svcClientConfig: IPlanhatClientConfig = {
            accessToken: "yp42nhyhAKFLUSg5y4u0w==",
            apiPrefix: "api",
            tenantId: "py3h8hbrn"
        };

        nock('https://api.planhat.com')
            .matchHeader('authorization', `Bearer ${svcClientConfig.accessToken}`)
            .put(`/endusers/${data.id}`)
            .replyWithError('Some arbitrary error');
        
        const svcClient = new PlanhatClient(svcClientConfig);
        const actual = await svcClient.updateContact(data);
        const expected: IApiResultObject<IPlanhatContact> = {
            data: undefined,
            endpoint: `https://api.planhat.com/endusers/${data.id}`,
            method: "update",
            record: data,
            success: false,
            error: 'Some arbitrary error'
        };
        expect(actual).toEqual(expected);
    });

    test('should delete an existing contact and return success', async () => {
        const dataId = "1234";

        const svcClientConfig: IPlanhatClientConfig = {
            accessToken: "yp42nhyhAKFLUSg5y4u0w==",
            apiPrefix: "api",
            tenantId: "py3h8hbrn"
        };

        nock('https://api.planhat.com')
            .matchHeader('authorization', `Bearer ${svcClientConfig.accessToken}`)
            .delete(`/endusers/${dataId}`)
            .reply(204, {}, { 'Content-Type': 'application/json' });
        
        const svcClient = new PlanhatClient(svcClientConfig);
        const actual = await svcClient.deleteContact(dataId);
        const expected: IApiResultObject<IPlanhatContact> = {
            data: {},
            endpoint: `https://api.planhat.com/endusers/${dataId}`,
            method: "delete",
            record: undefined,
            success: true,
            error: undefined
        };
        expect(actual).toEqual(expected);
    });

    test('should not throw if api returns status 500 for delete contact', async () => {
        const dataId = "1234";

        const svcClientConfig: IPlanhatClientConfig = {
            accessToken: "yp42nhyhAKFLUSg5y4u0w==",
            apiPrefix: "api",
            tenantId: "py3h8hbrn"
        };

        nock('https://api.planhat.com')
            .matchHeader('authorization', `Bearer ${svcClientConfig.accessToken}`)
            .delete(`/endusers/${dataId}`)
            .replyWithError('Some arbitrary error');
        
        const svcClient = new PlanhatClient(svcClientConfig);
        const actual = await svcClient.deleteContact(dataId);
        const expected: IApiResultObject<IPlanhatContact> = {
            data: undefined,
            endpoint: `https://api.planhat.com/endusers/${dataId}`,
            method: "delete",
            record: undefined,
            success: false,
            error: 'Some arbitrary error'
        };
        expect(actual).toEqual(expected);
    });

    test('should query an existing company by externalId', async() => {
        const externalId = "company1234";
        const data: IPlanhatCompany = {
            id: "863969",
            externalId,
            name: "Company 1234 Inc.",
            phase: "customer"
        };

        const svcClientConfig: IPlanhatClientConfig = {
            accessToken: "yp42nhyhAKFLUSg5y4u0w==",
            apiPrefix: "api",
            tenantId: "py3h8hbrn"
        };

        nock('https://api.planhat.com')
            .matchHeader('authorization', `Bearer ${svcClientConfig.accessToken}`)
            .get(`/leancompanies?externalId=${externalId}`)
            .reply(200, data, { 'Content-Type': 'application/json' });
        
        const svcClient = new PlanhatClient(svcClientConfig);
        const actual = await svcClient.findCompanyByExternalId(externalId);
        const expected: IApiResultObject<IPlanhatCompany> = {
            data,
            endpoint: `https://api.planhat.com/leancompanies?externalId=${externalId}`,
            method: "query",
            record: undefined,
            success: true
        };
        expect(actual).toEqual(expected);
    });

    test('should not throw if api returns status 500 for querying an existing company by externalId', async() => {
        const externalId = "company1234";

        const svcClientConfig: IPlanhatClientConfig = {
            accessToken: "yp42nhyhAKFLUSg5y4u0w==",
            apiPrefix: "api",
            tenantId: "py3h8hbrn"
        };

        nock('https://api.planhat.com')
            .matchHeader('authorization', `Bearer ${svcClientConfig.accessToken}`)
            .get(`/leancompanies?externalId=${externalId}`)
            .replyWithError('Some arbitrary error');
        
        const svcClient = new PlanhatClient(svcClientConfig);
        const actual = await svcClient.findCompanyByExternalId(externalId);
        const expected: IApiResultObject<IPlanhatCompany> = {
            data: undefined,
            endpoint: `https://api.planhat.com/leancompanies?externalId=${externalId}`,
            method: "query",
            record: undefined,
            success: false,
            error: 'Some arbitrary error'
        };
        expect(actual).toEqual(expected);
    });

    test('should create a new company and return success', async() => {
        const data: IPlanhatCompany = {
            externalId: "company1234",
            name: "Company 1234 Inc.",
            phase: "customer"
        };

        const svcClientConfig: IPlanhatClientConfig = {
            accessToken: "yp42nhyhAKFLUSg5y4u0w==",
            apiPrefix: "api",
            tenantId: "py3h8hbrn"
        };

        nock('https://api.planhat.com')
            .matchHeader('authorization', `Bearer ${svcClientConfig.accessToken}`)
            .post(`/companies`)
            .reply(200, data, { 'Content-Type': 'application/json' });
        
        const svcClient = new PlanhatClient(svcClientConfig);
        const actual = await svcClient.createCompany(data);
        const expected: IApiResultObject<IPlanhatCompany> = {
            data,
            endpoint: `https://api.planhat.com/companies`,
            method: "insert",
            record: data,
            success: true
        };
        expect(actual).toEqual(expected);
    });

    test('should not throw if api returns status 500 to create company', async() => {
        const data: IPlanhatCompany = {
            externalId: "company1234",
            name: "Company 1234 Inc.",
            phase: "customer"
        };

        const svcClientConfig: IPlanhatClientConfig = {
            accessToken: "yp42nhyhAKFLUSg5y4u0w==",
            apiPrefix: "api",
            tenantId: "py3h8hbrn"
        };

        nock('https://api.planhat.com')
            .matchHeader('authorization', `Bearer ${svcClientConfig.accessToken}`)
            .post(`/companies`)
            .replyWithError('Some arbitrary error');
        
        const svcClient = new PlanhatClient(svcClientConfig);
        const actual = await svcClient.createCompany(data);
        const expected: IApiResultObject<IPlanhatCompany> = {
            data: undefined,
            endpoint: `https://api.planhat.com/companies`,
            method: "insert",
            record: data,
            success: false,
            error: 'Some arbitrary error'
        };
        expect(actual).toEqual(expected);
    });

    test('should update an existing company and return success', async() => {
        const data: IPlanhatCompany = {
            id: "863969",
            externalId: "company1234",
            name: "Company 1234 Inc.",
            phase: "customer"
        };

        const svcClientConfig: IPlanhatClientConfig = {
            accessToken: "yp42nhyhAKFLUSg5y4u0w==",
            apiPrefix: "api",
            tenantId: "py3h8hbrn"
        };

        nock('https://api.planhat.com')
            .matchHeader('authorization', `Bearer ${svcClientConfig.accessToken}`)
            .put(`/companies/${data.id}`)
            .reply(200, data, { 'Content-Type': 'application/json' });
        
        const svcClient = new PlanhatClient(svcClientConfig);
        const actual = await svcClient.updateCompany(data);
        const expected: IApiResultObject<IPlanhatCompany> = {
            data,
            endpoint: `https://api.planhat.com/companies/${data.id}`,
            method: "update",
            record: data,
            success: true
        };
        expect(actual).toEqual(expected);
    });

    test('should not throw if api returns status 500 to update company', async() => {
        const data: IPlanhatCompany = {
            id: "863969",
            externalId: "company1234",
            name: "Company 1234 Inc.",
            phase: "customer"
        };

        const svcClientConfig: IPlanhatClientConfig = {
            accessToken: "yp42nhyhAKFLUSg5y4u0w==",
            apiPrefix: "api",
            tenantId: "py3h8hbrn"
        };

        nock('https://api.planhat.com')
            .matchHeader('authorization', `Bearer ${svcClientConfig.accessToken}`)
            .put(`/companies/${data.id}`)
            .replyWithError('Some arbitrary error');
        
        const svcClient = new PlanhatClient(svcClientConfig);
        const actual = await svcClient.updateCompany(data);
        const expected: IApiResultObject<IPlanhatCompany> = {
            data: undefined,
            endpoint: `https://api.planhat.com/companies/${data.id}`,
            method: "update",
            record: data,
            success: false,
            error: 'Some arbitrary error'
        };
        expect(actual).toEqual(expected);
    });

    test('should delete an existing company and return success', async() => {
        const dataId = "863969";

        const svcClientConfig: IPlanhatClientConfig = {
            accessToken: "yp42nhyhAKFLUSg5y4u0w==",
            apiPrefix: "api",
            tenantId: "py3h8hbrn"
        };

        nock('https://api.planhat.com')
            .matchHeader('authorization', `Bearer ${svcClientConfig.accessToken}`)
            .delete(`/companies/${dataId}`)
            .reply(204, {}, { 'Content-Type': 'application/json' });
        
        const svcClient = new PlanhatClient(svcClientConfig);
        const actual = await svcClient.deleteCompany(dataId);
        const expected: IApiResultObject<IPlanhatCompany> = {
            data: {},
            endpoint: `https://api.planhat.com/companies/${dataId}`,
            method: "delete",
            record: undefined,
            success: true,
            error: undefined
        };
        expect(actual).toEqual(expected);
    });

    test('should not throw if api returns status 500 to delete company', async() => {
        const dataId = "863969";

        const svcClientConfig: IPlanhatClientConfig = {
            accessToken: "yp42nhyhAKFLUSg5y4u0w==",
            apiPrefix: "api",
            tenantId: "py3h8hbrn"
        };

        nock('https://api.planhat.com')
            .matchHeader('authorization', `Bearer ${svcClientConfig.accessToken}`)
            .delete(`/companies/${dataId}`)
            .replyWithError('Some arbitrary error');
        
        const svcClient = new PlanhatClient(svcClientConfig);
        const actual = await svcClient.deleteCompany(dataId);
        const expected: IApiResultObject<IPlanhatCompany> = {
            data: undefined,
            endpoint: `https://api.planhat.com/companies/${dataId}`,
            method: "delete",
            record: undefined,
            success: false,
            error: 'Some arbitrary error'
        };
        expect(actual).toEqual(expected);
    });

    test('should track event and return success', async() => {
        const data: IPlanhatEvent = {
            action: "Account created",
            companyExternalId: "company1234",
            date: new Date().toISOString(),
            email: "test1@hull.io",
            externalId: "usr64593",
            name: "John Smith"
        };

        const svcClientConfig: IPlanhatClientConfig = {
            accessToken: "yp42nhyhAKFLUSg5y4u0w==",
            apiPrefix: "api",
            tenantId: "py3h8hbrn"
        };

        nock('https://analytics.planhat.com') // No authentication required for this one
            .post(`/analytics/${svcClientConfig.tenantId}`)
            .reply(201, {}, { 'Content-Type': 'application/json' });
        
            const svcClient = new PlanhatClient(svcClientConfig);
            const actual = await svcClient.trackEvent(data);
            const expected: IApiResultObject<IPlanhatEvent> = {
                data: {},
                endpoint: `https://analytics.planhat.com/analytics/${svcClientConfig.tenantId}`,
                method: "insert",
                record: data,
                success: true
            };
            expect(actual).toEqual(expected);
    });
});