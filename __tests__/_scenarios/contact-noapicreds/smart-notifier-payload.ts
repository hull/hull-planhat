import _ from "lodash";
import payload from "../../_data/user-update-message.json";
import { API_PREFIX } from "../../_helpers/constants";

const basePayload = _.cloneDeep(payload);

const configurePayload = (): unknown => {
  // Configure private_settings
  _.unset(basePayload, "connector.private_settings.personal_acccess_token");
  _.set(basePayload, "connector.private_settings.api_prefix", API_PREFIX);
  _.set(
    basePayload,
    "connector.private_settings.contact_synchronized_segments",
    ["72abf64e-7f60-4d7e-85b8-5f2f572318bb"],
  );
  // Configure segments
  const msgSegments = [
    {
      id: "72abf64e-7f60-4d7e-85b8-5f2f572318bb",
      created_at: new Date().toISOString(),
      name: "Test Segment",
      type: "users_segment",
      updated_at: new Date().toISOString(),
      stats: {},
    },
  ];
  // Set the account
  const account = {
    external_id: "vhoih28[hbnjnmwjnjbfoho",
    id: "0df9fa5d-ce4c-4065-a8ba-3e25470f17e7",
    name: "Test 1234 Inc.",
  };
  _.set(basePayload, "messages[0].account", account);
  // Set the user segments
  _.set(basePayload, "messages[0].segments", msgSegments);

  return basePayload;
};

// eslint-disable-next-line import/no-default-export
export default configurePayload;
