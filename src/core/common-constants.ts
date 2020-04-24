export const STATUS_PAT_MISSING =
  "Connector unauthenticated: No Personal Access Token present.";
export const STATUS_TENANTID_MISSING =
  "Connector unauthenticated: No Tenant Token present.";
export const STATUS_INVALID_MAPPING_PLANHAT = (
  hullAttr: string,
  serviceField: string,
  section: string,
): string => {
  return `Invalid mapping: The mapping Hull: '${hullAttr}' Planhat: '${serviceField}' in section has an invalid value for Planhat in section '${section}'.`;
};
export const STATUS_INCOMPLETE_LICENSEMAP_ACCOUNTATTRIBUTE =
  "Incomplete License mapping: You have not configured the account attribute containing the JSON array for licenses ('Licenses account attribute') but have defined the attribute mappings. No licenses will be synchronized";
export const STATUS_INCOMPLETE_LICENSEMAP_ITEMMAPPINGS =
  "Incomplete License mapping: You have not configured the item mappings ('Licenses attributes mapping') but have defined the account attribute mapping for the JSON array.  No licenses will be synchronized";
