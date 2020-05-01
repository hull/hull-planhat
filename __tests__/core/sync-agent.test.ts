import nock from "nock";
import _ from "lodash";
import { AwilixContainer, createContainer, asClass, asValue } from "awilix";
import { DateTime } from "luxon";
import { ContextMock } from "../_helpers/mocks";
import SyncAgent from "../../src/core/sync-agent";
import { ConnectorStatusResponse } from "../../src/types/connector-status";
import {
  STATUS_PAT_MISSING,
  STATUS_TENANTID_MISSING,
  STATUS_INVALID_MAPPING_PLANHAT,
  STATUS_INCOMPLETE_LICENSEMAP_ITEMMAPPINGS,
  STATUS_INCOMPLETE_LICENSEMAP_ACCOUNTATTRIBUTE,
  STATUS_REQUIRED_MAPPING_MISSING,
  STATUS_REQUIRED_MAPPING_MISSING_ALT,
} from "../../src/core/common-constants";
import PLANHAT_PROPERTIES from "../../src/core/planhat-properties";

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
        { hull_field_name: "lastName", service_field_name: undefined },
        { hull_field_name: "name", service_field_name: "name" },
        { hull_field_name: "external_id", service_field_name: "externalId" },
        { hull_field_name: "email", service_field_name: "Email" }, // <- this is invalid
      ];
      _.set(
        basePayload,
        "connector.private_settings.contact_attributes_outbound",
        mappingsOutContact,
      );
      const mappingsOutCompany = [
        { hull_field_name: undefined, service_field_name: "Foo" },
        { hull_field_name: "slug", service_field_name: undefined },
        { hull_field_name: "name", service_field_name: "name" },
        { hull_field_name: "co_owner", service_field_name: "co_owner" }, // <- this is invalid
      ];
      _.set(
        basePayload,
        "connector.private_settings.account_attributes_outbound",
        mappingsOutCompany,
      );
      const mappingsOutLicenses = [
        { hull_field_name: undefined, service_field_name: "Foo" },
        { hull_field_name: "currency", service_field_name: undefined },
        { hull_field_name: "currency", service_field_name: "_currency" },
        { hull_field_name: "id", service_field_name: "externalId" },
        { hull_field_name: "start_date", service_field_name: "fromDate" },
        { hull_field_name: "mrr", service_field_name: "mrr" },
        { hull_field_name: "currency", service_field_name: "Currency" }, // <- this is invalid
      ];
      _.set(
        basePayload,
        "connector.private_settings.account_licenses_attributes_outbound",
        mappingsOutLicenses,
      );
      _.set(
        basePayload,
        "connector.private_settings.account_licenses_attribute",
        "ph_licenses",
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
            "co_owner",
            "co_owner",
            "Account attributes mapping",
          ),
          STATUS_INVALID_MAPPING_PLANHAT(
            "currency",
            "Currency",
            "Licenses attributes mapping",
          ),
        ],
      };
      const actual = await syncAgent.determineConnectorStatus();
      expect(actual).toEqual(expected);
    });

    it("should return status 'error' if connector has required mappings outbound missing for endusers", async () => {
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
      // Set all required fields for endusers:
      // - Either externalId or email
      // - Either name or fistName and lastName
      const mappingsOutContact: any[] = [];
      _.set(
        basePayload,
        "connector.private_settings.contact_attributes_outbound",
        mappingsOutContact,
      );
      const mappingsOutCompany: any[] = [
        { hull_field_name: "name", service_field_name: "name" },
      ];
      _.set(
        basePayload,
        "connector.private_settings.account_attributes_outbound",
        mappingsOutCompany,
      );
      // Licenses, if not configured, has no required ones, so leave unconfigured
      _.unset(
        basePayload,
        "connector.private_settings.account_licenses_attribute",
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
          STATUS_REQUIRED_MAPPING_MISSING_ALT(
            PLANHAT_PROPERTIES.CONTACTS.externalId,
            PLANHAT_PROPERTIES.CONTACTS.email,
            "User attributes mapping",
          ),
          STATUS_REQUIRED_MAPPING_MISSING_ALT(
            PLANHAT_PROPERTIES.CONTACTS.name,
            `${PLANHAT_PROPERTIES.CONTACTS.firstName} and ${PLANHAT_PROPERTIES.CONTACTS.lastName}`,
            "User attributes mapping",
          ),
        ],
      };

      const actual = await syncAgent.determineConnectorStatus();
      expect(actual).toEqual(expected);
    });

    it("should return status 'error' if connector has required mappings outbound missing for companies", async () => {
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
      // Set all required fields for endusers:
      // - Either externalId or email
      // - Either name or fistName and lastName
      const mappingsOutContact = [
        { hull_field_name: "external_id", service_field_name: "externalId" },
        { hull_field_name: "name", service_field_name: "name" },
      ];
      _.set(
        basePayload,
        "connector.private_settings.contact_attributes_outbound",
        mappingsOutContact,
      );
      // Required for company is 'name'
      const mappingsOutCompany: any[] = [];
      _.set(
        basePayload,
        "connector.private_settings.account_attributes_outbound",
        mappingsOutCompany,
      );
      // Licenses, if not configured, has no required ones, so leave unconfigured
      _.unset(
        basePayload,
        "connector.private_settings.account_licenses_attribute",
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
          STATUS_REQUIRED_MAPPING_MISSING(
            "Name (*)",
            "Account attributes mapping",
          ),
        ],
      };

      const actual = await syncAgent.determineConnectorStatus();
      expect(actual).toEqual(expected);
    });

    it("should return status 'error' if connector has required mappings outbound missing for licenses", async () => {
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
      // Set all required fields for endusers:
      // - Either externalId or email
      // - Either name or fistName and lastName
      const mappingsOutContact = [
        { hull_field_name: "external_id", service_field_name: "externalId" },
        { hull_field_name: "name", service_field_name: "name" },
      ];
      _.set(
        basePayload,
        "connector.private_settings.contact_attributes_outbound",
        mappingsOutContact,
      );
      // Set all required fields for companies:
      const mappingsOutCompany: any[] = [
        { hull_field_name: "name", service_field_name: "name" },
      ];
      _.set(
        basePayload,
        "connector.private_settings.account_attributes_outbound",
        mappingsOutCompany,
      );
      // Licenses, if not configured, has no required ones, so leave unconfigured
      _.set(
        basePayload,
        "connector.private_settings.account_licenses_attribute",
        "unified.ph_licenses",
      );
      const mapingsLicenses: any[] = [
        { hull_field_name: "license_name", service_field_name: "product" },
      ];
      _.set(
        basePayload,
        "connector.private_settings.account_licenses_attributes_outbound",
        mapingsLicenses,
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
          STATUS_REQUIRED_MAPPING_MISSING(
            PLANHAT_PROPERTIES.LICENSES.externalId,
            "Licenses attributes mapping",
          ),
          STATUS_REQUIRED_MAPPING_MISSING(
            // eslint-disable-next-line no-underscore-dangle
            PLANHAT_PROPERTIES.LICENSES._currency,
            "Licenses attributes mapping",
          ),
          STATUS_REQUIRED_MAPPING_MISSING(
            PLANHAT_PROPERTIES.LICENSES.fromDate,
            "Licenses attributes mapping",
          ),
          STATUS_REQUIRED_MAPPING_MISSING_ALT(
            PLANHAT_PROPERTIES.LICENSES.mrr,
            PLANHAT_PROPERTIES.LICENSES.value,
            "Licenses attributes mapping",
          ),
        ],
      };

      const actual = await syncAgent.determineConnectorStatus();
      expect(actual).toEqual(expected);
    });
  });

  describe("fetch accounts", () => {
    const basePayload = _.cloneDeep(
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("../_data/user-update-message.json"),
    );

    it("should return immediately if the connector cannot communicate with the API", async () => {
      _.unset(basePayload, "connector.private_settings.personal_acccess_token");

      ctxMock.connector = basePayload.connector;
      ctxMock.ship = basePayload.connector;

      const syncAgent = new SyncAgent(
        ctxMock.client,
        ctxMock.connector,
        ctxMock.metric,
        container,
      );
      const actual = await syncAgent.fetchIncoming("companies");

      expect(actual).toBeFalsy();
    });

    it("should return immediately if the connector is currently processing a job", async () => {
      const objectType = "companies";
      const mockGet = jest.fn();
      mockGet.mockImplementation(async (key: string) => {
        const pageCount = 100;
        const iniTimestamp = new DateTime().toUTC().toISO();
        let result;
        switch (key) {
          case `${objectType}_${basePayload.connector.id}_currentjob`:
            result = {
              objectType,
              endDate: undefined,
              lastActivity: iniTimestamp,
              startDate: iniTimestamp,
              offset: 0,
              limit: pageCount,
              filterStart: DateTime.fromISO("1970-01-01T00:00:00.000Z")
                .toUTC()
                .toISO(),
              totalRecords: 0,
              importedRecords: 0,
            };
            break;
          default:
            result = undefined;
            break;
        }

        return Promise.resolve(result);
      });
      const mockRedisClient = jest.fn().mockImplementation(() => {
        return {
          get: mockGet,
        };
      });

      container.register({
        redisClient: asClass(mockRedisClient),
      });

      ctxMock.connector = basePayload.connector;
      ctxMock.ship = basePayload.connector;

      const syncAgent = new SyncAgent(
        ctxMock.client,
        ctxMock.connector,
        ctxMock.metric,
        container,
      );
      const actual = await syncAgent.fetchIncoming("companies");

      expect(actual).toBeFalsy();
    });

    const incomingAccountScenarios = ["fetch-companies-success"];
    _.forEach(incomingAccountScenarios, scenarioName => {
      it(`should handle scenario '${scenarioName}'`, async () => {
        const payloadSetupFn: () => any = require(`../_scenarios/${scenarioName}/smart-notifier-payload`)
          .default;

        const mockGet = jest.fn(async (key: string) => {
          // eslint-disable-next-line no-console
          console.log(`Accessing Redis with key '${key}'`);
          return Promise.resolve(undefined);
        });
        const mockSet = jest.fn(async (key: string, data: any) => {
          // eslint-disable-next-line no-console
          console.log(`Setting data in Redis with key '${key}'`);
          return Promise.resolve(JSON.stringify(data));
        });
        const mockDel = jest.fn(async (key: string) => {
          // eslint-disable-next-line no-console
          console.log(`Deleting from Redis with key '${key}'`);
          return Promise.resolve(1);
        });

        const MockRedisClient = jest.fn().mockImplementation(() => {
          return {
            get: mockGet,
            set: mockSet,
            delete: mockDel,
          };
        });

        container.register({
          redisClient: asValue(new MockRedisClient()),
        });
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

        await syncAgent.fetchIncoming("companies");
        const ctxExpectationsFn: (
          ctx: ContextMock,
        ) => void = require(`../_scenarios/${scenarioName}/ctx-expectations`)
          .default;
        ctxExpectationsFn(ctxMock);
        expect(nock.isDone()).toBe(true);

        // Get current and last job
        expect(
          (container.resolve("redisClient") as any).get.mock.calls.length,
        ).toEqual(2);

        expect(
          (container.resolve("redisClient") as any).get.mock.calls[0],
        ).toEqual([`companies_${ctxMock.connector.id}_currentjob`]);

        expect(
          (container.resolve("redisClient") as any).get.mock.calls[1],
        ).toEqual([`companies_${ctxMock.connector.id}_lastjob`]);

        expect(
          (container.resolve("redisClient") as any).set.mock.calls.length,
        ).toEqual(3); // Current job start + Current job progress + Last job (after finish)

        expect(
          (container.resolve("redisClient") as any).delete.mock.calls.length,
        ).toEqual(1);

        expect(
          (container.resolve("redisClient") as any).delete.mock.calls[0],
        ).toEqual([`companies_${ctxMock.connector.id}_currentjob`]);
      });
    });
  });

  describe("fetch users", () => {
    /* const basePayload = _.cloneDeep(
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("../_data/user-update-message.json"),
    ); */
    const incomingUserScenarios = ["fetch-endusers-success"];
    _.forEach(incomingUserScenarios, scenarioName => {
      it(`should handle scenario '${scenarioName}'`, async () => {
        const payloadSetupFn: () => any = require(`../_scenarios/${scenarioName}/smart-notifier-payload`)
          .default;

        const mockGet = jest.fn(async (key: string) => {
          // eslint-disable-next-line no-console
          console.log(`Accessing Redis with key '${key}'`);
          return Promise.resolve(undefined);
        });
        const mockSet = jest.fn(async (key: string, data: any) => {
          // eslint-disable-next-line no-console
          console.log(`Setting data in Redis with key '${key}'`);
          return Promise.resolve(JSON.stringify(data));
        });
        const mockDel = jest.fn(async (key: string) => {
          // eslint-disable-next-line no-console
          console.log(`Deleting from Redis with key '${key}'`);
          return Promise.resolve(1);
        });

        const MockRedisClient = jest.fn().mockImplementation(() => {
          return {
            get: mockGet,
            set: mockSet,
            delete: mockDel,
          };
        });

        container.register({
          redisClient: asValue(new MockRedisClient()),
        });
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

        await syncAgent.fetchIncoming("endusers");
        const ctxExpectationsFn: (
          ctx: ContextMock,
        ) => void = require(`../_scenarios/${scenarioName}/ctx-expectations`)
          .default;
        ctxExpectationsFn(ctxMock);
        expect(nock.isDone()).toBe(true);

        // Get current and last job
        expect(
          (container.resolve("redisClient") as any).get.mock.calls.length,
        ).toEqual(2);

        expect(
          (container.resolve("redisClient") as any).get.mock.calls[0],
        ).toEqual([`endusers_${ctxMock.connector.id}_currentjob`]);

        expect(
          (container.resolve("redisClient") as any).get.mock.calls[1],
        ).toEqual([`endusers_${ctxMock.connector.id}_lastjob`]);

        expect(
          (container.resolve("redisClient") as any).set.mock.calls.length,
        ).toEqual(3); // Current job start + Current job progress + Last job (after finish)

        expect(
          (container.resolve("redisClient") as any).delete.mock.calls.length,
        ).toEqual(1);

        expect(
          (container.resolve("redisClient") as any).delete.mock.calls[0],
        ).toEqual([`endusers_${ctxMock.connector.id}_currentjob`]);
      });
    });
  });
});
/* eslint-enable global-require, import/no-dynamic-require, @typescript-eslint/no-explicit-any */
