export interface IMappingEntry {
    hull_field_name: string | undefined;
    service_field_name: string | undefined;
}

export default interface IPrivateSettings {
    personal_acccess_token?: string;
    api_prefix: string | undefined;
    tenant_id?: string;
    contact_synchronized_segments: string[];
    contact_events: string[];
    contact_attributes_outbound: IMappingEntry[];
    account_synchronized_segments: string[];
    account_require_externalid: boolean;
    account_attributes_outbound: IMappingEntry[];
    contact_custom_attributes_outbound: IMappingEntry[];
    account_custom_attributes_outbound: IMappingEntry[];
}