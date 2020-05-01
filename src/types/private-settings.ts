export interface MappingEntry {
  hull_field_name: string | undefined;
  service_field_name: string | undefined;
}

// eslint-disable-next-line import/no-default-export
export default interface PrivateSettings {
  personal_acccess_token?: string;
  api_prefix: string | undefined;
  tenant_id?: string;
  contact_synchronized_segments: string[];
  contact_events: string[];
  contact_attributes_outbound: MappingEntry[];
  account_synchronized_segments: string[];
  account_require_externalid: boolean;
  account_attributes_outbound: MappingEntry[];
  contact_custom_attributes_outbound: MappingEntry[];
  account_custom_attributes_outbound: MappingEntry[];
  account_licenses_attribute?: string;
  account_licenses_attributes_outbound?: MappingEntry[];
  account_licenses_custom_attributes_outbound?: MappingEntry[];
  fetch_interval_accounts?: string;
  fetch_interval_users?: string;
}
