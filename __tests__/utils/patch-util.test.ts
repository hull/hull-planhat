import PatchUtil from "../../src/utils/patch-util";
import PrivateSettings from "../../src/types/private-settings";
import {
  IPlanhatContact,
  IPlanhatCompany,
} from "../../src/core/planhat-objects";

/* eslint-disable @typescript-eslint/no-explicit-any */
describe("PatchUtil", () => {
  it("should pass smoke test", () => {
    expect(true).toBeTruthy();
  });

  it("should detect unchanged contacts", () => {
    const privateSettings: PrivateSettings = {
      account_attributes_outbound: [],
      account_custom_attributes_outbound: [],
      account_require_externalid: true,
      account_synchronized_segments: [],
      api_prefix: "api",
      contact_attributes_outbound: [
        {
          hull_field_name: "first_name",
          service_field_name: "firstName",
        },
        {
          hull_field_name: "last_name",
          service_field_name: "lastName",
        },
      ],
      contact_custom_attributes_outbound: [],
      contact_events: [],
      contact_synchronized_segments: [],
    };
    const util = new PatchUtil(privateSettings);
    const currentObj: IPlanhatContact = {
      companyId: "1234",
      _id: "2731ty983y",
      fistName: "John",
      lastName: "Doe",
    };
    const updatedObj: IPlanhatContact = {
      companyId: "1234",
      _id: "2731ty983y",
      fistName: "John",
      lastName: "Doe",
    };
    const actual = util.hasUserChangesToUpdate(updatedObj, currentObj);

    expect(actual).toEqual(false);
  });

  it("should treat name case-insensitive for change detection of contacts", () => {
    const privateSettings: PrivateSettings = {
      account_attributes_outbound: [],
      account_custom_attributes_outbound: [],
      account_require_externalid: true,
      account_synchronized_segments: [],
      api_prefix: "api",
      contact_attributes_outbound: [
        {
          hull_field_name: "name",
          service_field_name: "name",
        },
      ],
      contact_custom_attributes_outbound: [],
      contact_events: [],
      contact_synchronized_segments: [],
    };
    const util = new PatchUtil(privateSettings);
    const currentObj: IPlanhatContact = {
      companyId: "1234",
      _id: "2731ty983y",
      name: "John Doe",
    };
    const updatedObj: IPlanhatContact = {
      companyId: "1234",
      _id: "2731ty983y",
      name: "john doe",
    };
    const actual = util.hasUserChangesToUpdate(updatedObj, currentObj);

    expect(actual).toEqual(false);
  });

  it("should detect unchanged contacts with custom attributes", () => {
    const privateSettings: PrivateSettings = {
      account_attributes_outbound: [],
      account_custom_attributes_outbound: [],
      account_require_externalid: true,
      account_synchronized_segments: [],
      api_prefix: "api",
      contact_attributes_outbound: [
        {
          hull_field_name: "first_name",
          service_field_name: "firstName",
        },
        {
          hull_field_name: "last_name",
          service_field_name: "lastName",
        },
      ],
      contact_custom_attributes_outbound: [
        {
          hull_field_name: "unified.job_title",
          service_field_name: "Job Title",
        },
      ],
      contact_events: [],
      contact_synchronized_segments: [],
    };
    const util = new PatchUtil(privateSettings);
    const currentObj: IPlanhatContact = {
      companyId: "1234",
      _id: "2731ty983y",
      fistName: "John",
      lastName: "Doe",
      custom: {
        "Job Title": "Developer",
      },
    };
    const updatedObj: IPlanhatContact = {
      companyId: "1234",
      _id: "2731ty983y",
      fistName: "John",
      lastName: "Doe",
      custom: {
        "Job Title": "Developer",
      },
    };
    const actual = util.hasUserChangesToUpdate(updatedObj, currentObj);

    expect(actual).toEqual(false);
  });

  it("should detect changed contacts", () => {
    const privateSettings: PrivateSettings = {
      account_attributes_outbound: [],
      account_custom_attributes_outbound: [],
      account_require_externalid: true,
      account_synchronized_segments: [],
      api_prefix: "api",
      contact_attributes_outbound: [
        {
          hull_field_name: "first_name",
          service_field_name: "firstName",
        },
        {
          hull_field_name: "last_name",
          service_field_name: "lastName",
        },
      ],
      contact_custom_attributes_outbound: [],
      contact_events: [],
      contact_synchronized_segments: [],
    };
    const util = new PatchUtil(privateSettings);
    const currentObj: IPlanhatContact = {
      companyId: "1234",
      _id: "2731ty983y",
      fistName: "John",
      lastName: "D",
    };
    const updatedObj: IPlanhatContact = {
      companyId: "1234",
      _id: "2731ty983y",
      fistName: "John",
      lastName: "Doe",
    };
    const actual = util.hasUserChangesToUpdate(updatedObj, currentObj);

    expect(actual).toEqual(true);
  });

  it("should detect changed contacts with custom attributes", () => {
    const privateSettings: PrivateSettings = {
      account_attributes_outbound: [],
      account_custom_attributes_outbound: [],
      account_require_externalid: true,
      account_synchronized_segments: [],
      api_prefix: "api",
      contact_attributes_outbound: [
        {
          hull_field_name: "first_name",
          service_field_name: "firstName",
        },
        {
          hull_field_name: "last_name",
          service_field_name: "lastName",
        },
      ],
      contact_custom_attributes_outbound: [
        {
          hull_field_name: "unified.job_title",
          service_field_name: "Job Title",
        },
      ],
      contact_events: [],
      contact_synchronized_segments: [],
    };
    const util = new PatchUtil(privateSettings);
    const currentObj: IPlanhatContact = {
      companyId: "1234",
      _id: "2731ty983y",
      fistName: "J",
      lastName: "Doe",
      custom: {
        "Job Title": "Engineer",
      },
    };
    const updatedObj: IPlanhatContact = {
      companyId: "1234",
      _id: "2731ty983y",
      fistName: "John",
      lastName: "Doe",
      custom: {
        "Job Title": "Developer",
      },
    };
    const actual = util.hasUserChangesToUpdate(updatedObj, currentObj);

    expect(actual).toEqual(true);
  });

  it("should detect unchanged companies", () => {
    const privateSettings: PrivateSettings = {
      account_attributes_outbound: [
        {
          hull_field_name: "name",
          service_field_name: "name",
        },
      ],
      account_custom_attributes_outbound: [],
      account_require_externalid: true,
      account_synchronized_segments: [],
      api_prefix: "api",
      contact_attributes_outbound: [],
      contact_custom_attributes_outbound: [],
      contact_events: [],
      contact_synchronized_segments: [],
    };
    const util = new PatchUtil(privateSettings);
    const currentObj: IPlanhatCompany = {
      name: "Acme Inc.",
      externalId: "1234",
    };
    const updatedObj: IPlanhatCompany = {
      name: "Acme Inc.",
      externalId: "1234",
    };
    const actual = util.hasCompanyChangesToUpdate(updatedObj, currentObj);
    expect(actual).toEqual(false);
  });

  it("should detect unchanged companies with custom attributes", () => {
    const privateSettings: PrivateSettings = {
      account_attributes_outbound: [
        {
          hull_field_name: "name",
          service_field_name: "name",
        },
      ],
      account_custom_attributes_outbound: [
        {
          hull_field_name: "domain",
          service_field_name: "Website",
        },
      ],
      account_require_externalid: true,
      account_synchronized_segments: [],
      api_prefix: "api",
      contact_attributes_outbound: [],
      contact_custom_attributes_outbound: [],
      contact_events: [],
      contact_synchronized_segments: [],
    };
    const util = new PatchUtil(privateSettings);
    const currentObj: IPlanhatCompany = {
      name: "Acme Inc.",
      externalId: "1234",
      custom: {
        Website: "acme.com",
      },
    };
    const updatedObj: IPlanhatCompany = {
      name: "Acme Inc.",
      externalId: "1234",
      custom: {
        Website: "acme.com",
      },
    };
    const actual = util.hasCompanyChangesToUpdate(updatedObj, currentObj);
    expect(actual).toEqual(false);
  });

  it("should detect changed companies", () => {
    const privateSettings: PrivateSettings = {
      account_attributes_outbound: [
        {
          hull_field_name: "name",
          service_field_name: "name",
        },
      ],
      account_custom_attributes_outbound: [],
      account_require_externalid: true,
      account_synchronized_segments: [],
      api_prefix: "api",
      contact_attributes_outbound: [],
      contact_custom_attributes_outbound: [],
      contact_events: [],
      contact_synchronized_segments: [],
    };
    const util = new PatchUtil(privateSettings);
    const currentObj: IPlanhatCompany = {
      name: "Acme Corp",
      externalId: "1234",
    };
    const updatedObj: IPlanhatCompany = {
      name: "Acme Inc.",
      externalId: "1234",
    };
    const actual = util.hasCompanyChangesToUpdate(updatedObj, currentObj);
    expect(actual).toEqual(true);
  });

  it("should detect changed companies with custom attributes", () => {
    const privateSettings: PrivateSettings = {
      account_attributes_outbound: [
        {
          hull_field_name: "name",
          service_field_name: "name",
        },
      ],
      account_custom_attributes_outbound: [
        {
          hull_field_name: "domain",
          service_field_name: "Website",
        },
      ],
      account_require_externalid: true,
      account_synchronized_segments: [],
      api_prefix: "api",
      contact_attributes_outbound: [],
      contact_custom_attributes_outbound: [],
      contact_events: [],
      contact_synchronized_segments: [],
    };
    const util = new PatchUtil(privateSettings);
    const currentObj: IPlanhatCompany = {
      name: "Acme Inc.",
      externalId: "1234",
      custom: {
        Website: "acme.us",
      },
    };
    const updatedObj: IPlanhatCompany = {
      name: "Acme Inc.",
      externalId: "1234",
      custom: {
        Website: "acme.com",
      },
    };
    const actual = util.hasCompanyChangesToUpdate(updatedObj, currentObj);
    expect(actual).toEqual(true);
  });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
