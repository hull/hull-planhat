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
            service_field_name: "externalId"
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
            service_field_name: "externalId"
        });
        const util = new MappingUtil(privateSettings);
        const msg: IHullUserUpdateMessage = _.cloneDeep(userUpdateMessage.messages[0]) as any;
        msg.account = {
            id: "23t18ogftnwheflbhmwbiornhl",
            external_id: "test-acct-1234",
            name: "Test Account 1234",
            domain: "hull.io",
            planhat: {
                id: "21otgahlbznst"
            }
        };
        const actual = util.mapHullUserToPlanhatContact(msg);
        const expected: IPlanhatContact = {
            companyId: "21otgahlbznst",
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
            service_field_name: "externalId"
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
            service_field_name: "externalId"
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
            service_field_name: "externalId"
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

    test('should map a planhat contact to Hull user attributes', () => {
        const privateSettings: IPrivateSettings = _.cloneDeep(userUpdateMessage.connector.private_settings);
        const util = new MappingUtil(privateSettings);

        const dataCreatedContact: IPlanhatContact = {
            companyId: "1234",
            createDate: new Date(1563804862).toISOString(),
            email: "test1@hull.io",
            name: "John Miller",
            "otherEmails": [],
            "featured": false,
            "tags": [],
            "personas": [],
            "npsUnsubscribed": false,
            "beatTrend": 0,
            "beats": 0,
            "convs14": 0,
            "convsTotal": 0,
            "beatsTotal": 0,
            "experience": 0,
            "_id": "5d81eb28aeeafc7a74d8f999",
            "firstName": "John",
            "lastName": "Miller",
            "companyName": "Test 1234 Inc.",
            "lastActivities": [],
            "relatedEndusers": [],
            "emailMd5": "53d22e4afda071779fafc63ba1433906",
            "__v": 0
        };

        const actual = util.mapPlanhatContactToUserAttributes(dataCreatedContact);

        const expected = {
            "planhat/company_id": dataCreatedContact.companyId,
            "planhat/create_date": dataCreatedContact.createDate,
            "planhat/email": dataCreatedContact.email,
            "planhat/name": dataCreatedContact.name,
            "planhat/other_emails": dataCreatedContact.otherEmails,
            "planhat/featured": dataCreatedContact.featured,
            "planhat/tags": dataCreatedContact.tags,
            "planhat/personas": dataCreatedContact.personas,
            "planhat/nps_unsubscribed": dataCreatedContact.npsUnsubscribed,
            "planhat/beat_trend": dataCreatedContact.beatTrend,
            "planhat/beats": dataCreatedContact.beats,
            "planhat/convs_14": dataCreatedContact.convs14,
            "planhat/convs_total": dataCreatedContact.convsTotal,
            "planhat/beats_total": dataCreatedContact.beatsTotal,
            "planhat/experience": dataCreatedContact.experience,
            "planhat/id": dataCreatedContact._id,
            "planhat/first_name": dataCreatedContact.firstName,
            "planhat/last_name": dataCreatedContact.lastName,
            "planhat/company_name": dataCreatedContact.companyName,
            "planhat/last_activities": dataCreatedContact.lastActivities,
            "planhat/related_endusers": dataCreatedContact.relatedEndusers,
            "planhat/email_md_5": dataCreatedContact.emailMd5,
            name: { value: dataCreatedContact.name, operation: "setIfNull" }
        };

        expect(actual).toEqual(expected);
    });

    test('should map a planhat company to Hull account attributes', () => {
        const privateSettings: IPrivateSettings = _.cloneDeep(userUpdateMessage.connector.private_settings);
        const util = new MappingUtil(privateSettings);

        const dataCreatedCompany: IPlanhatCompany = {
            _id: "1234",
            name: "Test 1234 Inc.",
            slug: "test1234inc",
            "shareable": {
                "enabled": false,
                "euIds": [],
                "sunits": false
            },
            "followers": [],
            "domains": [],
            "collaborators": [],
            "products": [],
            "tags": [],
            "lastPerformedTriggers": [],
            "createDate": "2019-09-18T08:16:31.223Z",
            "lastUpdated": "2019-09-18T08:16:31.223Z",
            "lastTouchByType": {},
            "sales": [],
            "licenses": [],
            "features": {},
            "sunits": {},
            "usage": {},
            "csmScoreLog": [],
            "documents": [],
            "links": [],
            "alerts": [],
            "lastActivities": [],
            "nrr30": 0,
            "nrrTotal": 0,
            "mrrTotal": 0,
            "mrr": 0,
            "status": "prospect",
            "mr": 0,
            "mrTotal": 0,
            "__v": 0
        };

        const expected = {
            "planhat/id": dataCreatedCompany._id,
            "planhat/name": dataCreatedCompany.name,
            "planhat/slug": dataCreatedCompany.slug,
            "planhat/followers": dataCreatedCompany.followers,
            "planhat/domains": dataCreatedCompany.domains,
            "planhat/collaborators": dataCreatedCompany.collaborators,
            "planhat/products": dataCreatedCompany.products,
            "planhat/tags": dataCreatedCompany.tags,
            "planhat/last_performed_triggers": dataCreatedCompany.lastPerformedTriggers,
            "planhat/create_date": dataCreatedCompany.createDate,
            "planhat/last_updated_at": dataCreatedCompany.lastUpdated,
            "planhat/last_touch_by_type": dataCreatedCompany.lastTouchByType,
            "planhat/sales": dataCreatedCompany.sales,
            "planhat/licenses": dataCreatedCompany.licenses,
            "planhat/features": dataCreatedCompany.features,
            "planhat/sunits": dataCreatedCompany.sunits,
            "planhat/usage": dataCreatedCompany.usage,
            "planhat/csm_score_log": dataCreatedCompany.csmScoreLog,
            "planhat/documents": dataCreatedCompany.documents,
            "planhat/links": dataCreatedCompany.links,
            "planhat/alerts": dataCreatedCompany.alerts,
            "planhat/last_activities": dataCreatedCompany.lastActivities,
            "planhat/nrr_30": dataCreatedCompany.nrr30,
            "planhat/nrr_total": dataCreatedCompany.nrrTotal,
            "planhat/mrr_total": dataCreatedCompany.mrrTotal,
            "planhat/mrr": dataCreatedCompany.mrr,
            "planhat/status": dataCreatedCompany.status,
            "planhat/mr": dataCreatedCompany.mr,
            "planhat/mr_total": dataCreatedCompany.mrTotal,
            "name": { value: dataCreatedCompany.name, operation: "setIfNull" }
        };

        const actual = util.mapPlanhatCompanyToAccountAttributes(dataCreatedCompany);
        expect(actual).toEqual(expected);
    });
});