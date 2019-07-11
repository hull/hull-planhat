import _ from "lodash";
import MappingUtil from "../../src/utils/mapping-util";
import userUpdateMessage from "../_data/user-update-message.json";
import accountUpdateMessage from "../_data/account-update-message.json";
import IPrivateSettings from "../../src/types/private-settings";
import IHullUserUpdateMessage from "../../src/types/user-update-message";
import IHullAccountUpdateMessage from "../../src/types/account-update-message";
import { IPlanhatContact, IPlanhatCompany, IPlanhatEvent } from "../../src/core/planhat-objects";
import PLANHAT_PROPERTIES from "../../src/core/planhat-properties";
import IHullUserEvent from "../../src/types/user-event";

describe('MappingUtil', () => {
    test('should pass smoke test', () => {
        expect(true).toBeTruthy();
    });

    test('should map a Hull user without an account to a Planhat contact', () => {
        const privateSettings: IPrivateSettings = _.cloneDeep(userUpdateMessage.connector.private_settings);
        // Configure the private_settings
        privateSettings.contact_attributes_outbound.push({
            hull_field_name: "external_id",
            service_field_name: PLANHAT_PROPERTIES.CONTACTS.externalId
        });
        const util = new MappingUtil(privateSettings);
        const msg: IHullUserUpdateMessage = _.cloneDeep(userUpdateMessage.messages[0]) as any;
        const actual = util.mapHullUserToPlanhatContact(msg);
        const expected: IPlanhatContact = {
            companyId: undefined,
            email: msg.user.email as string,
            name: msg.user.name as string,
            externalId: msg.user.external_id as string
        };
        expect(actual).toEqual(expected);
    });

    test('should map a Hull user with an account to a Planhat contact', () => {
        const privateSettings: IPrivateSettings = _.cloneDeep(userUpdateMessage.connector.private_settings);
        // Configure the private_settings
        privateSettings.contact_attributes_outbound.push({
            hull_field_name: "external_id",
            service_field_name: PLANHAT_PROPERTIES.CONTACTS.externalId
        });
        const util = new MappingUtil(privateSettings);
        const msg: IHullUserUpdateMessage = _.cloneDeep(userUpdateMessage.messages[0]) as any;
        msg.account = {
            id: "23t18ogftnwheflbhmwbiornhl",
            external_id: "test-acct-1234",
            name: "Test Account 1234",
            domain: "hull.io"
        };
        const actual = util.mapHullUserToPlanhatContact(msg);
        const expected: IPlanhatContact = {
            companyId: "test-acct-1234",
            email: msg.user.email as string,
            name: msg.user.name as string,
            externalId: msg.user.external_id as string
        };
        expect(actual).toEqual(expected);
    });

    test('should not fail to map a Hull user if no mappings are defined', () => {
        const privateSettings: IPrivateSettings = _.cloneDeep(userUpdateMessage.connector.private_settings);
        // Configure the private_settings
        privateSettings.contact_attributes_outbound = [];
        const util = new MappingUtil(privateSettings);
        const msg: IHullUserUpdateMessage = _.cloneDeep(userUpdateMessage.messages[0]) as any;
        const actual = util.mapHullUserToPlanhatContact(msg);
        const expected: IPlanhatContact = {
            companyId: undefined
        };
        expect(actual).toEqual(expected);
    });

    test('should map a Hull account to a Planhat company', () => {
        const privateSettings: IPrivateSettings = _.cloneDeep(accountUpdateMessage.connector.private_settings);
        // Configure the private_settings
        privateSettings.account_attributes_outbound.push({
            hull_field_name: 'external_id',
            service_field_name: PLANHAT_PROPERTIES.COMPANIES.externalId
        });
        const util = new MappingUtil(privateSettings);
        const msg: IHullAccountUpdateMessage = _.cloneDeep(accountUpdateMessage.messages[0]) as any;
        const actual = util.mapHullAccountToPlanhatCompany(msg);
        const expected: IPlanhatCompany = {
            name: "Test 1234",
            externalId: "test-group-1nhb9l"
        };

        expect(actual).toEqual(expected);
    });

    test('should not fail to map a Hull account to a Planhat company if no mappings are defined', () => {
        const privateSettings: IPrivateSettings = _.cloneDeep(accountUpdateMessage.connector.private_settings);
        // Configure the private_settings
        privateSettings.account_attributes_outbound = [];
        const util = new MappingUtil(privateSettings);
        const msg: IHullAccountUpdateMessage = _.cloneDeep(accountUpdateMessage.messages[0]) as any;
        const actual = util.mapHullAccountToPlanhatCompany(msg);
        const expected: IPlanhatCompany = {
            name: undefined
        };

        expect(actual).toEqual(expected);
    });

    test('should map a Hull event to a Planhat event for a user without an account', () => {
        const privateSettings: IPrivateSettings = _.cloneDeep(userUpdateMessage.connector.private_settings);
        // Configure the private_settings
        privateSettings.contact_attributes_outbound.push({
            hull_field_name: "external_id",
            service_field_name: PLANHAT_PROPERTIES.CONTACTS.externalId
        });
        const util = new MappingUtil(privateSettings);
        const msg: IHullUserUpdateMessage = _.cloneDeep(userUpdateMessage.messages[0]) as any;
        const hullEvent: IHullUserEvent = {
            context: {
                ip: 0,
                useragent: "other"
            },
            created_at: new Date().toISOString(),
            event: "Account created",
            properties: {
                account_id: "jgrh2phgbph",
                name: "Test account"
            }
        };
        const actual = util.mapHullUserEventToPlanhatEvent(msg, hullEvent);
        const expected: IPlanhatEvent = {
            action: hullEvent.event,
            date: hullEvent.created_at,
            email: msg.user.email as string,
            info: hullEvent.properties,
            name: msg.user.name as string,
            externalId: msg.user.external_id as string
        };
        expect(actual).toEqual(expected);
    });

    test('should map a Hull event to a Planhat event for a user with an account', () => {
        const privateSettings: IPrivateSettings = _.cloneDeep(userUpdateMessage.connector.private_settings);
        // Configure the private_settings
        privateSettings.contact_attributes_outbound.push({
            hull_field_name: "external_id",
            service_field_name: PLANHAT_PROPERTIES.CONTACTS.externalId
        });
        const util = new MappingUtil(privateSettings);
        const msg: IHullUserUpdateMessage = _.cloneDeep(userUpdateMessage.messages[0]) as any;
        msg.account = {
            id: "23t18ogftnwheflbhmwbiornhl",
            external_id: "test-acct-1234",
            name: "Test Account 1234",
            domain: "hull.io"
        };
        const hullEvent: IHullUserEvent = {
            context: {
                ip: 0,
                useragent: "other"
            },
            created_at: new Date().toISOString(),
            event: "Account created",
            properties: {
                account_id: "jgrh2phgbph",
                name: "Test account"
            }
        };
        const actual = util.mapHullUserEventToPlanhatEvent(msg, hullEvent);
        const expected: IPlanhatEvent = {
            action: hullEvent.event,
            companyExternalId: msg.account.external_id,
            date: hullEvent.created_at,
            email: msg.user.email as string,
            info: hullEvent.properties,
            name: msg.user.name as string,
            externalId: msg.user.external_id as string
        };
        expect(actual).toEqual(expected);
    });
});