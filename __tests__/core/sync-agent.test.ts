import nock from "nock";
import _ from "lodash";
import { ContextMock } from "../_helpers/mocks";
import SyncAgent from "../../src/core/sync-agent";

/* eslint-disable global-require, import/no-dynamic-require, @typescript-eslint/no-explicit-any */
describe("SyncAgent", () => {
  let ctxMock: ContextMock;

  beforeEach(() => {
    ctxMock = new ContextMock(
      "1234",
      {},
      {
        account_attributes_outbound: [],
        account_custom_attributes_outbound: [],
        account_require_externalid: false,
        account_synchronized_segments: [],
        api_prefix: "api",
        contact_attributes_outbound: [],
        contact_custom_attributes_outbound: [],
        contact_events: [],
        contact_synchronized_segments: [],
      },
    );
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test("smoke test", () => {
    expect(ctxMock).toBeDefined();
  });

  const scenarios = [
    "contact-skip-all",
    "contact-insert",
    "contact-insert-existingcompany",
    "contact-insert-existingcompany-noid",
    "contact-update-noid",
    "contact-update-withid",
    "contact-noapicreds",
    "contact-skip-companyerror",
    "contact-skip-nochanges",
    "event-track",
  ];

  _.forEach(scenarios, scenarioName => {
    it(`should handle '${scenarioName}'`, async () => {
      const payloadSetupFn: () => any = require(`../_scenarios/${scenarioName}/smart-notifier-payload`)
        .default;
      const smartNotifierPayload = payloadSetupFn();

      ctxMock.connector = smartNotifierPayload.connector;
      ctxMock.ship = smartNotifierPayload.connector;

      const syncAgent = new SyncAgent(
        ctxMock.client,
        ctxMock.connector,
        ctxMock.metric,
      );

      const apiResponseSetupFn: (
        nock: any,
      ) => void = require(`../_scenarios/${scenarioName}/api-responses`)
        .default;
      apiResponseSetupFn(nock);

      await syncAgent.sendUserMessages(smartNotifierPayload.messages);
      const ctxExpectationsFn: (
        ctx: ContextMock,
      ) => void = require(`../_scenarios/${scenarioName}/ctx-expectations`)
        .default;
      ctxExpectationsFn(ctxMock);
      expect(nock.isDone()).toBe(true);
    });
  });

  const acctScenarios = ["account-insert", "account-update"];

  _.forEach(acctScenarios, scenarioName => {
    it(`should handle ${scenarioName}`, async () => {
      const payloadSetupFn: () => any = require(`../_scenarios/${scenarioName}/smart-notifier-payload`)
        .default;

      const smartNotifierPayload = payloadSetupFn();

      ctxMock.connector = smartNotifierPayload.connector;
      ctxMock.ship = smartNotifierPayload.connector;

      const syncAgent = new SyncAgent(
        ctxMock.client,
        ctxMock.connector,
        ctxMock.metric,
      );

      const apiResponseSetupFn: (
        nock: any,
      ) => void = require(`../_scenarios/${scenarioName}/api-responses`)
        .default;
      apiResponseSetupFn(nock);

      await syncAgent.sendAccountMessages(smartNotifierPayload.messages);
      const ctxExpectationsFn: (
        ctx: ContextMock,
      ) => void = require(`../_scenarios/${scenarioName}/ctx-expectations`)
        .default;
      ctxExpectationsFn(ctxMock);
      expect(nock.isDone()).toBe(true);
    });
  });
});
/* eslint-enable global-require, import/no-dynamic-require, @typescript-eslint/no-explicit-any */
