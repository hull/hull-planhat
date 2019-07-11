import IPrivateSettings, { IMappingEntry } from "../types/private-settings";
import IHullUserUpdateMessage from "../types/user-update-message";
import { IPlanhatContact, IPlanhatCompany, IPlanhatEvent } from "../core/planhat-objects";
import _ from "lodash";
import PLANHAT_PROPERTIES from "../core/planhat-properties";
import IHullAccountUpdateMessage from "../types/account-update-message";
import IHullUserEvent from "../types/user-event";

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
            _.set(mappedServiceProps, v, k);
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
                      _.get(mappedServiceProps, mapping.service_field_name),
                      _.get(message, messageProperty, undefined)
                    );
            }
        });

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
            _.set(mappedServiceProps, v, k);
        });
        // Instantiate ref
        const serviceObject: IPlanhatEvent = {
            name: undefined,
            action: undefined
        };

        // Obtain the mapped attributes from the Hull user
        const mappings = this._connectorSettings.contact_attributes_outbound;
        if (_.find(mappings, { service_field_name: PLANHAT_PROPERTIES.CONTACTS.name })) {
            const mapping: IMappingEntry = _.find(mappings, { service_field_name: PLANHAT_PROPERTIES.CONTACTS.name }) as IMappingEntry;
            serviceObject.name = _.get(message, `user.${mapping.hull_field_name}`, undefined);
        }

        if (_.find(mappings, { service_field_name: PLANHAT_PROPERTIES.CONTACTS.externalId })) {
            const mapping: IMappingEntry = _.find(mappings, { service_field_name: PLANHAT_PROPERTIES.CONTACTS.externalId }) as IMappingEntry;
            serviceObject.externalId = _.get(message, `user.${mapping.hull_field_name}`, undefined);
        }

        if (_.find(mappings, { service_field_name: PLANHAT_PROPERTIES.CONTACTS.email })) {
            const mapping: IMappingEntry = _.find(mappings, { service_field_name: PLANHAT_PROPERTIES.CONTACTS.email }) as IMappingEntry;
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
            _.set(mappedServiceProps, v, k);
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
                      _.get(mappedServiceProps, mapping.service_field_name),
                      _.get(message, messageProperty, undefined)
                    );
            }
        });

        // TODO: Map custom attributes

        // Remove all undefined values from the resulting object
        return _.pickBy(serviceObject, (v: any, k: string) => {
            if (k === "name") { // only required field
                return true;
            }
            return _.identity(v);
        }) as IPlanhatCompany;
    }
}

export default MappingUtil;