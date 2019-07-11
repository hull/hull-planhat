import nock from "nock";
import { IPlanhatContact } from "../../src/core/planhat-objects";
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
});