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
  _.set(
    basePayload,
    "connector.private_settings.account_licenses_attribute",
    "unified.ph_licenses",
  );
  _.set(
    basePayload,
    "connector.private_settings.account_licenses_attributes_outbound",
    [
      {
        hull_field_name: "id",
        service_field_name: "externalId",
      },
      {
        hull_field_name: "product",
        service_field_name: "product",
      },
      {
        hull_field_name: "currency",
        service_field_name: "_currency",
      },
      {
        hull_field_name: "start_date",
        service_field_name: "fromDate",
      },
      {
        hull_field_name: "mrr",
        service_field_name: "mrr",
      },
    ],
  );
  // Configure segments
  const msgSegments = [
    {
      id: "72abf64e-7f60-4d7e-85b8-5f2f572318bb",
      created_at: new Date().toISOString(),
      name: "Test Segment",
      type: "accounts_segment",
      updated_at: new Date().toISOString(),
      stats: {},
    },
  ];
  // Set the account
  const account = {
    external_id: "vhoih28[hbnjnmwjnjbfoho",
    id: "0df9fa5d-ce4c-4065-a8ba-3e25470f17e7",
    name: "Test 1234 Inc.",
    unified: {
      ph_licenses: [
        {
          id: "12345",
          product: "License Fee",
          currency: "USD",
          start_date: "2019-12-11T11:46:08+02:00",
          mrr: 499,
        },
      ],
    },
  };
  _.set(basePayload, "messages[0].account.external_id", account.external_id);
  _.set(basePayload, "messages[0].account.id", account.id);
  _.set(basePayload, "messages[0].account.name", account.name);
  _.set(
    basePayload,
    "messages[0].account.unified.ph_licenses",
    account.unified.ph_licenses,
  );
  // Set the user segments
  _.set(basePayload, "messages[0].account_segments", msgSegments);

  return basePayload;
};

// eslint-disable-next-line import/no-default-export
export default configurePayload;
