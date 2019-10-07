import { ContextMock } from "../_helpers/mocks";
import nock from "nock";
import _ from "lodash";
import SyncAgent from "../../src/core/sync-agent";

describe('SyncAgent', () => {
    let ctxMock: ContextMock;

    beforeEach(() => {
        ctxMock = new ContextMock("1234", {}, {
            account_attributes_outbound: [],
            account_require_externalid: false,
            account_synchronized_segments: [],
            api_prefix: 'api',
            contact_attributes_outbound: [],
            contact_events: [],
            contact_synchronized_segments: []
        });
    });

    afterEach(() => {
        nock.cleanAll();
    });

    test("smoke test", () => {
        expect(ctxMock).toBeDefined();
    });

    const scenarios = [
        'contact-skip-all',
        'contact-insert',
        'contact-insert-existingcompany',
        'contact-update-noid',
        'contact-update-withid'
    ];

    _.forEach(scenarios, (scenarioName) => {
        test('should insert a contact', async() => {
            const payloadSetupFn: () => any = require(`../_scenarios/${scenarioName}/smart-notifier-payload`).default;
            // tslint:disable-next-line:no-console
            console.log(payloadSetupFn);
            const smartNotifierPayload = payloadSetupFn();

            ctxMock.connector = smartNotifierPayload.connector;
            ctxMock.ship = smartNotifierPayload.connector;

            const syncAgent = new SyncAgent(ctxMock.client, ctxMock.connector, ctxMock.metric);

            const apiResponseSetupFn: (nock: any) => void = require(`../_scenarios/${scenarioName}/api-responses`).default;
            apiResponseSetupFn(nock);

            await syncAgent.sendUserMessages(smartNotifierPayload.messages);
            const ctxExpectationsFn: (ctx: ContextMock) => void = require(`../_scenarios/${scenarioName}/ctx-expectations`).default;
            ctxExpectationsFn(ctxMock);
            expect(nock.isDone()).toBe(true);

                
        });
    });
    
    const acctScenarios = [
        'account-insert',
        'account-update'
    ];

    _.forEach(acctScenarios, (scenarioName) => {
        test(`should handle ${scenarioName}`, async() => {
            const payloadSetupFn: () => any = require(`../_scenarios/${scenarioName}/smart-notifier-payload`).default;
            // tslint:disable-next-line:no-console
            console.log(payloadSetupFn);
            const smartNotifierPayload = payloadSetupFn();

            ctxMock.connector = smartNotifierPayload.connector;
            ctxMock.ship = smartNotifierPayload.connector;

            const syncAgent = new SyncAgent(ctxMock.client, ctxMock.connector, ctxMock.metric);

            const apiResponseSetupFn: (nock: any) => void = require(`../_scenarios/${scenarioName}/api-responses`).default;
            apiResponseSetupFn(nock);

            await syncAgent.sendAccountMessages(smartNotifierPayload.messages);
            const ctxExpectationsFn: (ctx: ContextMock) => void = require(`../_scenarios/${scenarioName}/ctx-expectations`).default;
            ctxExpectationsFn(ctxMock);
            expect(nock.isDone()).toBe(true);

        });
    });
});