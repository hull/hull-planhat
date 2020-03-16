import _ from "lodash";

import IPrivateSettings, { IMappingEntry } from "../types/private-settings";
import IHullUserUpdateMessage from "../types/user-update-message";
import IHullUserEvent from "../types/user-event";
import IHullAccountUpdateMessage from "../types/account-update-message";
import { IOperationEnvelope, IPlanhatContact, IPlanhatCompany } from "../core/planhat-objects";

class FilterUtil {
    private _contactSegments: string[];
    private _contactEvents: string[];
    private _contactAttributesOut: IMappingEntry[];
    private _accountSegments: string[];
    private _accountRequireExternalId: boolean;
    private _accountAttributesOut: IMappingEntry[];

    constructor(privateSettings: IPrivateSettings) {
        this._contactSegments = privateSettings.contact_synchronized_segments;
        this._contactEvents = privateSettings.contact_events;
        this._contactAttributesOut = privateSettings.contact_attributes_outbound;
        this._accountSegments = privateSettings.account_synchronized_segments;
        this._accountRequireExternalId = privateSettings.account_require_externalid;
        this._accountAttributesOut = privateSettings.account_attributes_outbound;
    }

    public filterUserMessages(messages: IHullUserUpdateMessage[], isBatch: boolean = false): Array<IOperationEnvelope<IPlanhatContact>> {
        const envelopes: Array<IOperationEnvelope<IPlanhatContact>> = [];
        if (isBatch === true) {
            _.forEach(messages, (message: IHullUserUpdateMessage) => {
                envelopes.push({
                    msg: message,
                    operation: "insert"
                });
            });
        } else {
            _.forEach(messages, (message: IHullUserUpdateMessage) => {
                const messageSegmentIds = message.segments.map(s => s.id);
                if (_.intersection(messageSegmentIds, this._contactSegments).length > 0) {
                    envelopes.push({
                        msg: message,
                        operation: "insert"
                    });
                } else {
                    envelopes.push({
                        msg: message,
                        operation: "skip",
                        reason: "User doesn't belong to any of the segments defined in the Contact Filter."
                    });
                }
            });
        }
        return envelopes;        
    }

    public filterContactEnvelopes(envelopes: Array<IOperationEnvelope<IPlanhatContact>>): Array<IOperationEnvelope<IPlanhatContact>> {
        _.forEach(envelopes, (envelope:IOperationEnvelope<IPlanhatContact>) => {
            const contact = envelope.serviceObject as IPlanhatContact;
            let op = envelope.operation;
            let reason = "";
            if (contact.companyId === undefined) {
                op = "skip";
                reason = "No company id present."
            }

            if (contact.email === undefined && contact.externalId === undefined) {
                op = "skip";
                reason += " Neither email nor external id present."
            }

            reason = _.trim(reason);
            envelope.operation = op;
            if (op === "skip" && reason.length > 0) {
                envelope.reason = reason;
            }
        });

        return envelopes;
    }

    public filterMessagesWithEvent(messages: IHullUserUpdateMessage[]): IHullUserUpdateMessage[] {
        const filteredMessages = _.filter(messages, (m: IHullUserUpdateMessage) => {
            if (!m.events || (m.events && m.events.length === 0)) {
                return false;
            }
            return _.some(m.events, (e: IHullUserEvent) => _.includes(this._contactEvents, e.event));
        });

        return filteredMessages;
    }

    public filterEvents(events: IHullUserEvent[]): IHullUserEvent[] {
        return _.filter(events, (evt: IHullUserEvent) => {
            return _.includes(this._contactEvents, evt.event);
        });
    }

    public filterAccountMessages(messages: IHullAccountUpdateMessage[], isBatch: boolean = false): Array<IOperationEnvelope<IPlanhatCompany>> {
        const envelopes: Array<IOperationEnvelope<IPlanhatCompany>> = [];
        
        if (isBatch === true) {
            if (this._accountRequireExternalId === true) {
                _.forEach(messages, (message: IHullAccountUpdateMessage) => {
                    if (_.get(message, "account.external_id", undefined) === undefined) {
                        envelopes.push({
                            msg: message,
                            operation: "skip",
                            reason: "The account in Hull has no external_id, but it is marked as required."
                        });
                    } else {
                        envelopes.push({
                            msg: message,
                            operation: "insert"
                        });
                    }
                });
            } else {
                _.forEach(messages, (message: IHullAccountUpdateMessage) => {
                    envelopes.push({
                        msg: message,
                        operation: "insert"
                    });
                });
            }
        } else {
            _.forEach(messages, (message: IHullAccountUpdateMessage) => {
                const messageSegmentIds = message.account_segments.map(s => s.id);
                let op: "insert" | "update" | "skip" = "insert";
                let reason = "";
                if (this._accountRequireExternalId === true && _.get(message, "account.external_id", undefined) === undefined) {
                    op = "skip";
                    reason = "The account in Hull has no external_id, but it is marked as required.";
                }

                if (_.intersection(messageSegmentIds, this._accountSegments).length === 0) {
                    op = "skip";
                    reason += " Account doesn't belong to any of the segments defined in the Account Filter.";
                }

                reason = reason.trim();
                const envelope = {
                    msg: message,
                    operation: op
                }
                if (op === "skip") {
                    _.set(envelope, "reason", reason);
                }

                envelopes.push(envelope);
            });
        }

        return envelopes;
    }

    public filterCompanyEnvelopes(envelopes: Array<IOperationEnvelope<IPlanhatCompany>>): Array<IOperationEnvelope<IPlanhatCompany>> {
        _.forEach(envelopes, (envelope:IOperationEnvelope<IPlanhatCompany>) => {
            const company = envelope.serviceObject as IPlanhatCompany;
            let op = envelope.operation;
            let reason = "";

            if (company.name === undefined || (_.isString(company.name) && company.name.length === 0)) {
                op = "skip";
                reason = "No company name present."
            }

            reason = _.trim(reason);
            envelope.operation = op;
            if (op === "skip" && reason.length > 0) {
                envelope.reason = reason;
            }
        });

        return envelopes;
    }
}

export default FilterUtil;