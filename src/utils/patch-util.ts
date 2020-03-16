import _ from "lodash";
import IPrivateSettings, { IMappingEntry } from "../types/private-settings";
import { IPlanhatContact, IPlanhatCompany } from "../core/planhat-objects";

class PatchUtil {
    private _connectorSettings: IPrivateSettings;

    constructor(connectorSettings: IPrivateSettings) {
        this._connectorSettings = connectorSettings;
    }

    public hasUserChangesToUpdate(updatedObj: IPlanhatContact, currentObj: IPlanhatContact): boolean {
        let hasUpdate = false;

        _.forEach(this._connectorSettings.contact_attributes_outbound, (mapping: IMappingEntry) => {
            if (_.get(updatedObj, mapping.service_field_name as string, undefined) !== 
                _.get(currentObj, mapping.service_field_name as string, undefined)) {
                hasUpdate = true;
            }
        });

        // Check the custom attributes
        _.forEach(this._connectorSettings.contact_custom_attributes_outbound, (mapping: IMappingEntry) => {
            if (_.get(updatedObj, `custom.${mapping.service_field_name}`, undefined) !== 
                _.get(currentObj, `custom.${mapping.service_field_name}`, undefined)) {
                hasUpdate = true;
            }
        });

        return hasUpdate;
    }

    public hasCompanyChangesToUpdate(updatedObj: IPlanhatCompany, currentObj: IPlanhatCompany): boolean {
        let hasUpdate = false;

        _.forEach(this._connectorSettings.account_attributes_outbound, (mapping: IMappingEntry) => {
            if (_.get(updatedObj, mapping.service_field_name as string, undefined) !== 
                _.get(currentObj, mapping.service_field_name as string, undefined)) {
                hasUpdate = true;
            }
        });

        // Check the custom attributes
        _.forEach(this._connectorSettings.account_custom_attributes_outbound, (mapping: IMappingEntry) => {
            if (_.get(updatedObj, `custom.${mapping.service_field_name}`, undefined) !== 
                _.get(currentObj, `custom.${mapping.service_field_name}`, undefined)) {
                hasUpdate = true;
            }
        });

        return hasUpdate;
    }
}

export default PatchUtil;