import _ from "lodash";
import FilterUtil from "../../src/utils/filter-util";
import userUpdateMessage from "../_data/user-update-message.json";
import accountUpdateMessage from "../_data/account-update-message.json";
import IPrivateSettings from "../../src/types/private-settings";
import IHullUserUpdateMessage from "../../src/types/user-update-message";
import IHullAccountUpdateMessage from "../../src/types/account-update-message";
import { IOperationEnvelope, IPlanhatContact, IPlanhatCompany } from "../../src/core/planhat-objects";

describe('MappingUtil', () => {
    test('should pass smoke test', () => {
        expect(true).toBeTruthy();
    });

    test('should filter all user messages out if no segments are defined', () => {
        const privateSettings: IPrivateSettings = _.cloneDeep(userUpdateMessage.connector.private_settings);
        const util = new FilterUtil(privateSettings);
        const messages: IHullUserUpdateMessage[] = _.cloneDeep(userUpdateMessage.messages) as any[];
        const actual = util.filterUserMessages(messages);
        const expected: Array<IOperationEnvelope<IPlanhatContact>> = _.map(messages, (msg: IHullUserUpdateMessage) => {
            return {
                msg,
                operation: "skip",
                reason: "User doesn't belong to any of the segments defined in the Contact Filter."
            }
        });
        expect(actual).toHaveLength(messages.length);
        expect(actual).toEqual(expected);
    });

    test('should filter all user messages out that do not match a segment', () => {
        const privateSettings: IPrivateSettings = _.cloneDeep(userUpdateMessage.connector.private_settings);
        // Configure private_settings
        privateSettings.contact_synchronized_segments = [ "72abf64e-7f60-4d7e-85b8-5f2f572318bb" ];
        const util = new FilterUtil(privateSettings);
        // Compose messages
        const msg1: IHullUserUpdateMessage = _.cloneDeep(userUpdateMessage.messages[0]) as any;
        msg1.segments = [
            {
                id: "72abf64e-7f60-4d7e-85b8-5f2f572318bb",
                created_at: new Date().toISOString(),
                name: "Test Segment",
                type: "users_segment",
                updated_at: new Date().toISOString(),
                stats: {}
            }
        ];
        const msg2: IHullUserUpdateMessage = _.cloneDeep(userUpdateMessage.messages[0]) as any;
        msg2.user.email = "test2@hull.io";
        msg2.user.external_id = "vo2g4bhp3bh",
        msg2.user.id = "499dae19-8c5f-4815-93d5-fa77e6698c3b";
        const messages = [ msg1, msg2 ];
        const actual = util.filterUserMessages(messages);
        const expected: Array<IOperationEnvelope<IPlanhatContact>> = [
            {
                msg: msg1,
                operation: "insert"
            },
            {
                msg: msg2,
                operation: "skip",
                reason: "User doesn't belong to any of the segments defined in the Contact Filter."
            }
        ] ;
        expect(actual).toHaveLength(2);
        expect(actual).toEqual(expected);
    });

    test('should filter all account messages out if no segments are defined', () => {
        const privateSettings: IPrivateSettings = _.cloneDeep(accountUpdateMessage.connector.private_settings);
        const util = new FilterUtil(privateSettings);
        const messages: IHullAccountUpdateMessage[] = _.cloneDeep(userUpdateMessage.messages) as any[];
        const actual = util.filterAccountMessages(messages);
        const expected: Array<IOperationEnvelope<IPlanhatCompany>> = _.map(messages, (msg: IHullUserUpdateMessage) => {
            return {
                msg,
                operation: "skip",
                reason: "Account doesn't belong to any of the segments defined in the Account Filter."
            }
        }) as any[];
        expect(actual).toHaveLength(messages.length);
        expect(actual).toEqual(expected);
    });

    test('should filter all account messages out that do not match a segment', () => {
        const privateSettings: IPrivateSettings = _.cloneDeep(accountUpdateMessage.connector.private_settings);
        // Configure private_settings
        privateSettings.account_synchronized_segments = [ "72abf64e-7f60-4d7e-85b8-5f2f572318bb" ];
        const util = new FilterUtil(privateSettings);
        // Compose messages
        const msg1: IHullAccountUpdateMessage = _.cloneDeep(accountUpdateMessage.messages[0]) as any;
        msg1.account_segments = [
            {
                id: "72abf64e-7f60-4d7e-85b8-5f2f572318bb",
                created_at: new Date().toISOString(),
                name: "Test Segment",
                type: "accounts_segment",
                updated_at: new Date().toISOString(),
                stats: {}
            }
        ];
        const msg2: IHullAccountUpdateMessage = _.cloneDeep(accountUpdateMessage.messages[0]) as any;
        if (msg2.account) {
            msg2.account.domain = "hullapp.net";
            msg2.account.external_id = "vo2g4bhp3bh",
            msg2.account.id = "499dae19-8c5f-4815-93d5-fa77e6698c3b";
        }
        const messages = [ msg1, msg2 ];
        const actual = util.filterAccountMessages(messages);
        const expected: Array<IOperationEnvelope<IPlanhatCompany>> = [
            {
                msg: msg1,
                operation: "insert"
            },
            {
                msg: msg2,
                operation: "skip",
                reason: "Account doesn't belong to any of the segments defined in the Account Filter."
            }
        ];
        expect(actual).toHaveLength(messages.length);
        expect(actual).toEqual(expected);
    });

    test('should filter all account messages out that do not match a segment or have no external_id when required', () => {
        const privateSettings: IPrivateSettings = _.cloneDeep(accountUpdateMessage.connector.private_settings);
        // Configure private_settings
        privateSettings.account_synchronized_segments = [ "72abf64e-7f60-4d7e-85b8-5f2f572318bb" ];
        privateSettings.account_require_externalid = true;
        const util = new FilterUtil(privateSettings);
        // Compose messages
        const msg1: IHullAccountUpdateMessage = _.cloneDeep(accountUpdateMessage.messages[0]) as any;
        msg1.account_segments = [
            {
                id: "72abf64e-7f60-4d7e-85b8-5f2f572318bb",
                created_at: new Date().toISOString(),
                name: "Test Segment",
                type: "accounts_segment",
                updated_at: new Date().toISOString(),
                stats: {}
            }
        ];
        const msg2: IHullAccountUpdateMessage = _.cloneDeep(accountUpdateMessage.messages[0]) as any;
        if (msg2.account) {
            msg2.account.domain = "hullapp.net";
            msg2.account.id = "499dae19-8c5f-4815-93d5-fa77e6698c3b";
        }
        _.unset(msg2, "account.external_id");
        msg2.account_segments = [
            {
                id: "72abf64e-7f60-4d7e-85b8-5f2f572318bb",
                created_at: new Date().toISOString(),
                name: "Test Segment",
                type: "accounts_segment",
                updated_at: new Date().toISOString(),
                stats: {}
            }
        ];
        const messages = [ msg1, msg2 ];
        const actual = util.filterAccountMessages(messages);
        const expected: Array<IOperationEnvelope<IPlanhatCompany>> = [
            {
                msg: msg1,
                operation: "insert"
            },
            {
                msg: msg2,
                operation: "skip",
                reason: "The account in Hull has no external_id, but it is marked as required."
            }
        ];
        expect(actual).toHaveLength(messages.length);
        expect(actual).toEqual(expected);
    });

    test('should filter all user messages out if no events are whitelisted', () => {
        const privateSettings: IPrivateSettings = _.cloneDeep(userUpdateMessage.connector.private_settings);
        const util = new FilterUtil(privateSettings);
        const messages: IHullUserUpdateMessage[] = _.cloneDeep(userUpdateMessage.messages) as any[];
        const actual = util.filterMessagesWithEvent(messages);
        const expected: IHullUserUpdateMessage[] = [];
        expect(actual).toHaveLength(0);
        expect(actual).toEqual(expected);
    });

    test('should filter all user messages out that do not match events filter', () => {
        const privateSettings: IPrivateSettings = _.cloneDeep(userUpdateMessage.connector.private_settings);
        // Configure private_settings
        privateSettings.contact_events = [ "Account created" ];
        const util = new FilterUtil(privateSettings);
        // Compose messages
        const msg1: IHullUserUpdateMessage = _.cloneDeep(userUpdateMessage.messages[0]) as any;
        msg1.events = [
            {
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
            },
            {
                context: {
                    ip: 0,
                    useragent: "other"
                },
                created_at: new Date().toISOString(),
                event: "Subscription created",
                properties: {
                    account_id: "jgrh2phgbph",
                    subscription_id: "sub_eh2b984hos"
                }
            }
        ]
        const msg2: IHullUserUpdateMessage = _.cloneDeep(userUpdateMessage.messages[0]) as any;
        msg2.user.email = "test2@hull.io";
        msg2.user.external_id = "vo2g4bhp3bh",
        msg2.user.id = "499dae19-8c5f-4815-93d5-fa77e6698c3b";
        msg2.events = [
            {
                context: {
                    ip: 0,
                    useragent: "other"
                },
                created_at: new Date().toISOString(),
                event: "Account updated",
                properties: {
                    account_id: "u30g42npgybwl",
                    name: "Test account 2"
                }
            }
        ]
        const messages = [ msg1, msg2 ];
        const actual = util.filterMessagesWithEvent(messages);
        const expected: IHullUserUpdateMessage[] = [msg1];
        expect(actual).toHaveLength(1);
        expect(actual).toEqual(expected);
    });
});