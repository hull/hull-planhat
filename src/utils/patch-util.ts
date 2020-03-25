import _ from "lodash";
import IPrivateSettings, { IMappingEntry } from "../types/private-settings";
import { IPlanhatContact, IPlanhatCompany } from "../core/planhat-objects";

class PatchUtil {
  private connectorSettings: IPrivateSettings;

  constructor(connectorSettings: IPrivateSettings) {
    this.connectorSettings = connectorSettings;
  }

  public hasUserChangesToUpdate(
    updatedObj: IPlanhatContact,
    currentObj: IPlanhatContact,
  ): boolean {
    let hasUpdate = false;

    _.forEach(
      this.connectorSettings.contact_attributes_outbound,
      (mapping: IMappingEntry) => {
        if (
          _.get(updatedObj, mapping.service_field_name as string, undefined) !==
          _.get(currentObj, mapping.service_field_name as string, undefined)
        ) {
          hasUpdate = true;
        }
      },
    );

    // Check the custom attributes
    _.forEach(
      this.connectorSettings.contact_custom_attributes_outbound,
      (mapping: IMappingEntry) => {
        if (
          _.get(
            updatedObj,
            `custom.${mapping.service_field_name}`,
            undefined,
          ) !==
          _.get(currentObj, `custom.${mapping.service_field_name}`, undefined)
        ) {
          hasUpdate = true;
        }
      },
    );

    return hasUpdate;
  }

  public hasCompanyChangesToUpdate(
    updatedObj: IPlanhatCompany,
    currentObj: IPlanhatCompany,
  ): boolean {
    let hasUpdate = false;

    _.forEach(
      this.connectorSettings.account_attributes_outbound,
      (mapping: IMappingEntry) => {
        if (
          _.get(updatedObj, mapping.service_field_name as string, undefined) !==
          _.get(currentObj, mapping.service_field_name as string, undefined)
        ) {
          hasUpdate = true;
        }
      },
    );

    // Check the custom attributes
    _.forEach(
      this.connectorSettings.account_custom_attributes_outbound,
      (mapping: IMappingEntry) => {
        if (
          _.get(
            updatedObj,
            `custom.${mapping.service_field_name}`,
            undefined,
          ) !==
          _.get(currentObj, `custom.${mapping.service_field_name}`, undefined)
        ) {
          hasUpdate = true;
        }
      },
    );

    return hasUpdate;
  }
}

// eslint-disable-next-line import/no-default-export
export default PatchUtil;
