import _ from "lodash";
import payload from "../../_data/user-update-message.json";
import { API_PREFIX, PERSONAL_ACCESS_TOKEN } from "../../_helpers/constants";

const basePayload = _.cloneDeep(payload);

const configurePayload = () => {
    // Configure private_settings
    _.set(basePayload, "connector.private_settings.personal_acccess_token", PERSONAL_ACCESS_TOKEN);
    _.set(basePayload, "connector.private_settings.api_prefix", API_PREFIX);
    _.set(basePayload, "connector.private_settings.contact_events", [ "72abf64e-7f60-4d7e-85b8-5f2f572318bb" ])
    // Configure segments
    const msgSegments = [
        {
            id: "72abf64e-7f60-4d7e-85b8-5f2f572318bb",
            created_at: new Date().toISOString(),
            name: "Test Segment",
            type: "users_segment",
            updated_at: new Date().toISOString(),
            stats: {}
        }
    ];
    _.set(basePayload, "messages[0].segments", msgSegments);


    return basePayload;
};

export default configurePayload;