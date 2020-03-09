import IPrivateSettings, { IMappingEntry } from "../types/private-settings";
import IHullUserUpdateMessage from "../types/user-update-message";
import { IPlanhatContact, IPlanhatCompany, IPlanhatEvent, IOperationEnvelope } from "../core/planhat-objects";
import _ from "lodash";
import PLANHAT_PROPERTIES from "../core/planhat-properties";
import IHullAccountUpdateMessage from "../types/account-update-message";
import IHullUserEvent from "../types/user-event";
import { IHullUserAttributes } from "../types/user";
import IHullAccount, { IHullAccountAttributes } from "../types/account";
import IApiResultObject from "../types/api-result";

class MappingUtil {

    private _connectorSettings: IPrivateSettings;

    constructor(connectorSettings: IPrivateSettings) {
        this._connectorSettings = connectorSettings;
    }

    /**
     * Maps a hull user object to a Planhat contact object
     */
    public mapHullUserToPlanhatContact(message: IHullUserUpdateMessage): IPlanhatContact {
        // Map the service props so we can look them up
        const mappedServiceProps = {};
        _.forIn(PLANHAT_PROPERTIES.CONTACTS, (v: string, k: string) => {
            _.set(mappedServiceProps, k, v);
        });
        // Instantiate ref
        const serviceObject: IPlanhatContact = {
            companyId: undefined
        }
        // Map all standard attributes
        const mappings = this._connectorSettings.contact_attributes_outbound;
        _.forEach(mappings, (mapping: IMappingEntry) => {
            if (mapping.service_field_name !== undefined &&
                _.get(mappedServiceProps, mapping.service_field_name, undefined) !== undefined) {
                // Ensure we get the proper message property, we don't nest the account inside the user
                // when we receive data from Kraken, so if the mapping starts with `account.`, we
                // don't prefix it with `user.`: 
                const messageProperty: string = _.startsWith(mapping.hull_field_name, "account.") ?
                                        (mapping.hull_field_name as string):
                                        `user.${mapping.hull_field_name}`;
                // Make sure we have a consistent `undefined` if no data is present,
                // so we can rely on it for reducing the object
                _.set(serviceObject, 
                      mapping.service_field_name,
                      _.get(message, messageProperty, undefined)
                    );
            }
        });

        // Company ID can only be the internal ID from Planhat
        // so we need to overwrite legacy configurations
        _.set(serviceObject, "companyId", _.get(message, 'account.planhat.id', undefined));

        // TODO: Map custom attributes

        // Remove all undefined values from the resulting object
        return _.pickBy(serviceObject, (v: any, k: string) => {
            if (k === "companyId") { // only required field
                return true;
            }
            return _.identity(v);
        }) as IPlanhatContact;
    }

    /**
     * mapHullUserEventToPlanhatEvent
     */
    public mapHullUserEventToPlanhatEvent(message: IHullUserUpdateMessage, hullEvent: IHullUserEvent): IPlanhatEvent {
        // Map the service props so we can look them up
        const mappedServiceProps = {};
        _.forIn(PLANHAT_PROPERTIES.CONTACTS, (v: string, k: string) => {
            _.set(mappedServiceProps, k, v);
        });
        // Instantiate ref
        const serviceObject: IPlanhatEvent = {
            name: undefined,
            action: undefined
        };

        // Obtain the mapped attributes from the Hull user
        const mappings = this._connectorSettings.contact_attributes_outbound;
        if (_.find(mappings, { service_field_name: "name" })) {
            const mapping: IMappingEntry = _.find(mappings, { service_field_name: "name" }) as IMappingEntry;
            serviceObject.name = _.get(message, `user.${mapping.hull_field_name}`, undefined);
        }

        if (_.find(mappings, { service_field_name: "externalId" })) {
            const mapping: IMappingEntry = _.find(mappings, { service_field_name: "externalId" }) as IMappingEntry;
            serviceObject.externalId = _.get(message, `user.${mapping.hull_field_name}`, undefined);
        }

        if (_.find(mappings, { service_field_name: "email" })) {
            const mapping: IMappingEntry = _.find(mappings, { service_field_name: "email" }) as IMappingEntry;
            serviceObject.email = _.get(message, `user.${mapping.hull_field_name}`, undefined);
        }

        // Obtain the external_id from the Hull account
        if (_.get(message, "account.external_id", undefined) !== undefined) {
            serviceObject.companyExternalId = _.get(message, "account.external_id", undefined);
        }

        // Map the event name and date
        serviceObject.action = hullEvent.event;
        serviceObject.date = hullEvent.created_at;
        // Map all event properties
        serviceObject.info = hullEvent.properties;

        return serviceObject;
    }

    /**
     * Maps a hull account object to a Planhat company object
     */
    public mapHullAccountToPlanhatCompany(message: IHullAccountUpdateMessage): IPlanhatCompany {
        // Map the service props so we can look them up
        const mappedServiceProps = {};
        _.forIn(PLANHAT_PROPERTIES.COMPANIES, (v: string, k: string) => {
            _.set(mappedServiceProps, k, v);
        });
        // Instantiate ref
        const serviceObject: IPlanhatCompany = {
            name: undefined
        }
        // Map all standard attributes
        const mappings = this._connectorSettings.account_attributes_outbound;
        _.forEach(mappings, (mapping: IMappingEntry) => {
            if (mapping.service_field_name !== undefined &&
                _.get(mappedServiceProps, mapping.service_field_name, undefined) !== undefined) {
                // For accounts we can don't need any prefixing action here:
                const messageProperty: string = `account.${mapping.hull_field_name as string}`;
                // Make sure we have a consistent `undefined` if no data is present,
                // so we can rely on it for reducing the object
                _.set(serviceObject, 
                      mapping.service_field_name,
                      _.get(message, messageProperty, undefined)
                    );
            }
        });

        // TODO: Map custom attributes

        // Add the id if present
        if(_.get(message, "account.planhat.id", undefined) !== undefined) {
            _.set(serviceObject, "id", _.get(message, "account.planhat.id"));
        }

        // Remove all undefined values from the resulting object
        return _.pickBy(serviceObject, (v: any, k: string) => {
            if (k === "name") { // only required field
                return true;
            }
            return _.identity(v);
        }) as IPlanhatCompany;
    }

    /**
     * Map a Planhat Contact to user attributes in Hull.
     *
     * @param {IPlanhatContact} dataObject The contact object from Planhat.
     * @returns {IHullUserAttributes} The object representing the Hull user attributes.
     * @memberof MappingUtil
     */
    public mapPlanhatContactToUserAttributes(dataObject: IPlanhatContact): IHullUserAttributes {
        const attributes: IHullUserAttributes = {};

        _.forIn(dataObject, (v: any, k: string) => {
            if (k === "_id") {
                _.set(attributes, `planhat/id`, v);
            } else if(!_.startsWith(k, "_")) {
                _.set(attributes, `planhat/${_.snakeCase(k)}`, v);
            }
        });

        // Set the top level name attribute
        if(_.get(dataObject, "name", undefined) !== undefined) {
            _.set(attributes, "name", { value: _.get(dataObject, "name"), operation: "setIfNull" });
        }

        return attributes;
    }

    /**
     * Map a Planhat company to account attributes in Hull.
     *
     * @param {IPlanhatCompany} dataObject The company object from Planhat.
     * @returns {IHullAccountAttributes} The object representing the Hull account attributes.
     * @memberof MappingUtil
     */
    public mapPlanhatCompanyToAccountAttributes(dataObject: IPlanhatCompany): IHullAccountAttributes {
        const attributes: IHullAccountAttributes = {};

        _.forIn(dataObject, (v: any, k: string) => {
            if (k === "_id") {
                _.set(attributes, `planhat/id`, v);
            } else if(k === "lastUpdated") {
                _.set(attributes, `planhat/last_updated_at`, v);
            } else if(!_.startsWith(k, "_") && k !== "shareable") {
                _.set(attributes, `planhat/${_.snakeCase(k)}`, v);
            }
        });

        // Set the top level name attribute
        if(_.get(dataObject, "name", undefined) !== undefined) {
            _.set(attributes, "name", { value: _.get(dataObject, "name"), operation: "setIfNull" });
        }

        return attributes;
    }

    /**
     * Updates all user envelopes which have the same Hull account to avoid issues with creating accounts within the same batch.
     *
     * @param {Array<IOperationEnvelope<IPlanhatCompany>>} envelopes All valid envelopes.
     * @param {IOperationEnvelope<IPlanhatCompany>} currentEnvelope The current enevelope.
     * @param {IApiResultObject<IPlanhatCompany>} updateOrInsertResult The insert or update result of the current envelope's account.
     * @memberof MappingUtil
     */
    public updateUserEnvelopesWithCompanyId(envelopes: Array<IOperationEnvelope<IPlanhatContact>>, currentEnvelope: IOperationEnvelope<IPlanhatContact>, updateOrInsertResult: IApiResultObject<IPlanhatCompany>) {
        _.forEach(_.filter(envelopes, (e) => {
            return e.msg.account && e.msg.account.id === (currentEnvelope.msg.account as IHullAccount).id && e.msg.message_id !== currentEnvelope.msg.message_id;
        }) as Array<IOperationEnvelope<IPlanhatContact>>, (e: IOperationEnvelope<IPlanhatContact>) => {
            // tslint:disable-next-line:no-console
            console.log(e, updateOrInsertResult);
            _.set(e, "serviceObject.companyId", _.get(updateOrInsertResult, "data._id", undefined));
        });
    }

    /**
     * Updates all envelopes which have the same Hull account to avoid issues with creating accounts within the same batch.
     *
     * @param {Array<IOperationEnvelope<IPlanhatCompany>>} envelopes All valid envelopes.
     * @param {IOperationEnvelope<IPlanhatCompany>} currentEnvelope The current enevelope.
     * @param {IApiResultObject<IPlanhatCompany>} updateOrInsertResult The insert or update result of the current envelope's account.
     * @memberof MappingUtil
     */
    public updateEnvelopesWithCompanyId(envelopes: Array<IOperationEnvelope<IPlanhatCompany>>, currentEnvelope: IOperationEnvelope<IPlanhatCompany>, updateOrInsertResult: IApiResultObject<IPlanhatCompany>) {
        _.forEach(_.filter(envelopes, (e) => {
            // tslint:disable-next-line:no-console
            console.log(e, currentEnvelope);
            return e.msg.account && e.msg.account.id === (currentEnvelope.msg.account as IHullAccount).id && e.msg.message_id !== currentEnvelope.msg.message_id;
        }) as Array<IOperationEnvelope<IPlanhatCompany>>, (e: IOperationEnvelope<IPlanhatCompany>) => {
            _.set(e, "serviceObject.id", _.get(updateOrInsertResult, "data._id", undefined));
        });
    }
}

export default MappingUtil;