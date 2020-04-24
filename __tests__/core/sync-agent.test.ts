import nock from "nock";
import _ from "lodash";
import { AwilixContainer, createContainer } from "awilix";
import { ContextMock } from "../_helpers/mocks";
import SyncAgent from "../../src/core/sync-agent";
import { ConnectorStatusResponse } from "../../src/types/connector-status";
import {
  STATUS_PAT_MISSING,
  STATUS_TENANTID_MISSING,
  STATUS_INVALID_MAPPING_PLANHAT,
  STATUS_INCOMPLETE_LICENSEMAP_ITEMMAPPINGS,
  STATUS_INCOMPLETE_LICENSEMAP_ACCOUNTATTRIBUTE,
} from "../../src/core/common-constants";

/* eslint-disable global-require, import/no-dynamic-require, @typescript-eslint/no-explicit-any */
describe("SyncAgent", () => {
  let ctxMock: ContextMock;
  let container: AwilixContainer;

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

    container = createContainer();
  });

  afterEach(() => {
    nock.cleanAll();
    container.dispose();
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
    "event-track-error",
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
        container,
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

  const acctScenarios = [
    "account-insert",
    "account-update",
    "account-insert-licenses",
    "account-update-licenses",
  ];

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
        container,
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

  describe("determineConnectorStatus", () => {
    it("should return status 'setupRequired' if connector is not configured", async () => {
      const basePayload = _.cloneDeep(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("../_data/user-update-message.json"),
      );
      _.unset(basePayload, "connector.private_settings.personal_acccess_token");
      _.unset(basePayload, "connector.private_settings.tenant_id");
      ctxMock.connector = basePayload.connector;
      ctxMock.ship = basePayload.connector;

      const syncAgent = new SyncAgent(
        ctxMock.client,
        ctxMock.connector,
        ctxMock.metric,
        container,
      );

      const expected: ConnectorStatusResponse = {
        status: "setupRequired",
        messages: [STATUS_PAT_MISSING, STATUS_TENANTID_MISSING],
      };
      const actual = await syncAgent.determineConnectorStatus();
      expect(actual).toEqual(expected);
    });

    it("should return status 'warning' if connector has account attribute for licenses but no mappings", async () => {
      const basePayload = _.cloneDeep(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("../_data/user-update-message.json"),
      );
      _.set(
        basePayload,
        "connector.private_settings.personal_acccess_token",
        "yt430yh8tt9rmw",
      );
      _.set(basePayload, "connector.private_settings.tenant_id", "tenant1234");
      const mappingsOutContact = [
        { hull_field_name: "name", service_field_name: "name" },
        { hull_field_name: "email", service_field_name: "email" },
      ];
      _.set(
        basePayload,
        "connector.private_settings.contact_attributes_outbound",
        mappingsOutContact,
      );
      const mappingsOutCompany = [
        { hull_field_name: "name", service_field_name: "name" },
      ];
      _.set(
        basePayload,
        "connector.private_settings.account_attributes_outbound",
        mappingsOutCompany,
      );

      _.set(
        basePayload,
        "connector.private_settings.account_licenses_attribute",
        "unified.ph_licenses",
      );

      ctxMock.connector = basePayload.connector;
      ctxMock.ship = basePayload.connector;

      const syncAgent = new SyncAgent(
        ctxMock.client,
        ctxMock.connector,
        ctxMock.metric,
        container,
      );

      const expected: ConnectorStatusResponse = {
        status: "warning",
        messages: [STATUS_INCOMPLETE_LICENSEMAP_ITEMMAPPINGS],
      };
      const actual = await syncAgent.determineConnectorStatus();
      expect(actual).toEqual(expected);
    });

    it("should return status 'warning' if connector has no account attribute for licenses but mappings", async () => {
      const basePayload = _.cloneDeep(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("../_data/user-update-message.json"),
      );
      _.set(
        basePayload,
        "connector.private_settings.personal_acccess_token",
        "yt430yh8tt9rmw",
      );
      _.set(basePayload, "connector.private_settings.tenant_id", "tenant1234");
      const mappingsOutContact = [
        { hull_field_name: "name", service_field_name: "name" },
        { hull_field_name: "email", service_field_name: "email" },
      ];
      _.set(
        basePayload,
        "connector.private_settings.contact_attributes_outbound",
        mappingsOutContact,
      );
      const mappingsOutCompany = [
        { hull_field_name: "name", service_field_name: "name" },
      ];
      _.set(
        basePayload,
        "connector.private_settings.account_attributes_outbound",
        mappingsOutCompany,
      );

      _.unset(
        basePayload,
        "connector.private_settings.account_licenses_attribute",
      );

      _.set(
        basePayload,
        "connector.private_settings.account_licenses_attributes_outbound",
        [
          { hull_field_name: "id", service_field_name: "externalId" },
          { hull_field_name: "product", service_field_name: "product" },
          { hull_field_name: "currency", service_field_name: "_currency" },
          { hull_field_name: "start_at", service_field_name: "fromDate" },
        ],
      );

      ctxMock.connector = basePayload.connector;
      ctxMock.ship = basePayload.connector;

      const syncAgent = new SyncAgent(
        ctxMock.client,
        ctxMock.connector,
        ctxMock.metric,
        container,
      );

      const expected: ConnectorStatusResponse = {
        status: "warning",
        messages: [STATUS_INCOMPLETE_LICENSEMAP_ACCOUNTATTRIBUTE],
      };
      const actual = await syncAgent.determineConnectorStatus();
      expect(actual).toEqual(expected);
    });

    it("should return status 'error' if connector has invalid mappings outbound", async () => {
      const basePayload = _.cloneDeep(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("../_data/user-update-message.json"),
      );
      _.set(
        basePayload,
        "connector.private_settings.personal_acccess_token",
        "yt430yh8tt9rmw",
      );
      _.set(basePayload, "connector.private_settings.tenant_id", "tenant1234");
      const mappingsOutContact = [
        { hull_field_name: undefined, service_field_name: "Foo" },
        { hull_field_name: "name", service_field_name: undefined },
        { hull_field_name: "email", service_field_name: "Email" }, // <- this is invalid
      ];
      _.set(
        basePayload,
        "connector.private_settings.contact_attributes_outbound",
        mappingsOutContact,
      );
      const mappingsOutCompany = [
        { hull_field_name: undefined, service_field_name: "Foo" },
        { hull_field_name: "name", service_field_name: undefined },
        { hull_field_name: "name", service_field_name: "Name" }, // <- this is invalid
      ];
      _.set(
        basePayload,
        "connector.private_settings.account_attributes_outbound",
        mappingsOutCompany,
      );

      ctxMock.connector = basePayload.connector;
      ctxMock.ship = basePayload.connector;

      const syncAgent = new SyncAgent(
        ctxMock.client,
        ctxMock.connector,
        ctxMock.metric,
        container,
      );

      const expected: ConnectorStatusResponse = {
        status: "error",
        messages: [
          STATUS_INVALID_MAPPING_PLANHAT(
            "email",
            "Email",
            "User attributes mapping",
          ),
          STATUS_INVALID_MAPPING_PLANHAT(
            "name",
            "Name",
            "Account attributes mapping",
          ),
        ],
      };
      const actual = await syncAgent.determineConnectorStatus();
      expect(actual).toEqual(expected);
    });
  });
});
/* eslint-enable global-require, import/no-dynamic-require, @typescript-eslint/no-explicit-any */
