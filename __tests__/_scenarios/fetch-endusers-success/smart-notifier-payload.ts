import _ from "lodash";
import payload from "../../_data/account-update-message.json";
import { API_PREFIX, PERSONAL_ACCESS_TOKEN } from "../../_helpers/constants";

const basePayload = _.cloneDeep(payload);

const configurePayload = (): unknown => {
  // Configure private_settings
  _.set(
    basePayload,
    "connector.private_settings.personal_acccess_token",
    PERSONAL_ACCESS_TOKEN,
  );
  _.set(basePayload, "connector.private_settings.api_prefix", API_PREFIX);
  _.set(
    basePayload,
    "connector.private_settings.account_synchronized_segments",
    ["72abf64e-7f60-4d7e-85b8-5f2f572318bb"],
  );

  return basePayload;
};

// eslint-disable-next-line import/no-default-export
export default configurePayload;
