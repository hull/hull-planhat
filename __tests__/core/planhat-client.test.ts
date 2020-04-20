import nock from "nock";
import {
  IPlanhatContact,
  IPlanhatCompany,
  IPlanhatEvent,
  PlanhatUser,
  PlanhatLicense,
} from "../../src/core/planhat-objects";
import IPlanhatClientConfig from "../../src/types/planhat-client-config";
import PlanhatClient from "../../src/core/planhat-client";
import IApiResultObject from "../../src/types/api-result";
import PlanhatUsersResponseData from "../_data/planhat-users.json";
import PlanhatUserResponseData from "../_data/planhat-user.json";
import PlanhatLicenseResponseData from "../_data/planhat-license.json";

describe("PlanhatClient", () => {
  beforeEach(() => {
    nock.cleanAll();
    nock.restore();

    if (!nock.isActive()) {
      nock.activate();
    }
  });

  afterAll(() => {
    nock.cleanAll();
    nock.restore();
  });

  test("should pass smoke test", () => {
    expect(true).toBeTruthy();
  });

  test("should query an existing contact by email", async () => {
    const email = "test1@hull.io";
    const data: IPlanhatContact = {
      id: "1234",
      companyId: "company1234",
      createDate: new Date().toISOString(),
      email: "test1@hull.io",
      name: "John Smith",
    };

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .get(`/endusers?email=${email}`)
      .reply(200, data, { "Content-Type": "application/json" });

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.findContactByEmail(email);
    const expected: IApiResultObject<IPlanhatContact> = {
      data,
      endpoint: `https://api.planhat.com/endusers?email=${email}`,
      method: "query",
      record: undefined,
      success: true,
    };
    expect(actual).toEqual(expected);
  });

  test("should not throw if api return status 500 when querying an existing contact by email", async () => {
    const email = "test1@hull.io";

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .get(`/endusers?email=${email}`)
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.findContactByEmail(email);
    const expected: IApiResultObject<IPlanhatContact> = {
      data: undefined,
      endpoint: `https://api.planhat.com/endusers?email=${email}`,
      method: "query",
      record: undefined,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });

  test("should create a new contact and return success", async () => {
    const data: IPlanhatContact = {
      companyId: "company1234",
      createDate: new Date().toISOString(),
      email: "test1@hull.io",
      name: "John Smith",
    };

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .post("/endusers")
      .reply(200, data, { "Content-Type": "application/json" });

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.createContact(data);
    const expected: IApiResultObject<IPlanhatContact> = {
      data,
      endpoint: "https://api.planhat.com/endusers",
      method: "insert",
      record: data,
      success: true,
    };
    expect(actual).toEqual(expected);
  });

  test("should not throw if api returns status 500 for new contact", async () => {
    const data: IPlanhatContact = {
      companyId: "company1234",
      createDate: new Date().toISOString(),
      email: "test1@hull.io",
      name: "John Smith",
    };

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .post("/endusers")
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.createContact(data);
    const expected: IApiResultObject<IPlanhatContact> = {
      data: undefined,
      endpoint: "https://api.planhat.com/endusers",
      method: "insert",
      record: data,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });

  test("should update an existing contact and return success", async () => {
    const data: IPlanhatContact = {
      id: "1234",
      companyId: "company1234",
      createDate: new Date().toISOString(),
      email: "test1@hull.io",
      name: "John Smith",
    };

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .put(`/endusers/${data.id}`)
      .reply(200, data, { "Content-Type": "application/json" });

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.updateContact(data);
    const expected: IApiResultObject<IPlanhatContact> = {
      data,
      endpoint: `https://api.planhat.com/endusers/${data.id}`,
      method: "update",
      record: data,
      success: true,
    };
    expect(actual).toEqual(expected);
  });

  test("should not throw if api returns status 500 for update contact", async () => {
    const data: IPlanhatContact = {
      id: "1234",
      companyId: "company1234",
      createDate: new Date().toISOString(),
      email: "test1@hull.io",
      name: "John Smith",
    };

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .put(`/endusers/${data.id}`)
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.updateContact(data);
    const expected: IApiResultObject<IPlanhatContact> = {
      data: undefined,
      endpoint: `https://api.planhat.com/endusers/${data.id}`,
      method: "update",
      record: data,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });

  test("should delete an existing contact and return success", async () => {
    const dataId = "1234";

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .delete(`/endusers/${dataId}`)
      .reply(204, {}, { "Content-Type": "application/json" });

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.deleteContact(dataId);
    const expected: IApiResultObject<IPlanhatContact> = {
      data: {},
      endpoint: `https://api.planhat.com/endusers/${dataId}`,
      method: "delete",
      record: undefined,
      success: true,
      error: undefined,
    };
    expect(actual).toEqual(expected);
  });

  test("should not throw if api returns status 500 for delete contact", async () => {
    const dataId = "1234";

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .delete(`/endusers/${dataId}`)
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.deleteContact(dataId);
    const expected: IApiResultObject<IPlanhatContact> = {
      data: undefined,
      endpoint: `https://api.planhat.com/endusers/${dataId}`,
      method: "delete",
      record: undefined,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });

  test("should query an existing company by externalId", async () => {
    const externalId = "company1234";
    const data: IPlanhatCompany = {
      id: "863969",
      externalId,
      name: "Company 1234 Inc.",
      phase: "customer",
    };

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .get(`/leancompanies?externalId=${externalId}`)
      .reply(200, data, { "Content-Type": "application/json" });

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.findCompanyByExternalId(externalId);
    const expected: IApiResultObject<IPlanhatCompany> = {
      data,
      endpoint: `https://api.planhat.com/leancompanies?externalId=${externalId}`,
      method: "query",
      record: undefined,
      success: true,
    };
    expect(actual).toEqual(expected);
  });

  test("should not throw if api returns status 500 for querying an existing company by externalId", async () => {
    const externalId = "company1234";

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .get(`/leancompanies?externalId=${externalId}`)
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.findCompanyByExternalId(externalId);
    const expected: IApiResultObject<IPlanhatCompany> = {
      data: undefined,
      endpoint: `https://api.planhat.com/leancompanies?externalId=${externalId}`,
      method: "query",
      record: undefined,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });

  test("should query an existing company by id", async () => {
    const externalId = "company1234";
    const data: IPlanhatCompany = {
      _id: "863969",
      externalId,
      name: "Company 1234 Inc.",
      phase: "customer",
    };

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      // eslint-disable-next-line no-underscore-dangle
      .get(`/companies/${data._id}`)
      .reply(200, data, { "Content-Type": "application/json" });

    const svcClient = new PlanhatClient(svcClientConfig);
    // eslint-disable-next-line no-underscore-dangle
    const actual = await svcClient.getCompanyById(data._id as string);
    const expected: IApiResultObject<IPlanhatCompany> = {
      data,
      // eslint-disable-next-line no-underscore-dangle
      endpoint: `https://api.planhat.com/companies/${data._id}`,
      method: "query",
      record: undefined,
      success: true,
    };
    expect(actual).toEqual(expected);
  });

  test("should not throw if api returns status 500 for querying an existing company by id", async () => {
    const id = "867578";

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .get(`/companies/${id}`)
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.getCompanyById(id);
    const expected: IApiResultObject<IPlanhatCompany> = {
      data: undefined,
      endpoint: `https://api.planhat.com/companies/${id}`,
      method: "query",
      record: undefined,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });

  test("should create a new company and return success", async () => {
    const data: IPlanhatCompany = {
      externalId: "company1234",
      name: "Company 1234 Inc.",
      phase: "customer",
    };

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .post(`/companies`)
      .reply(200, data, { "Content-Type": "application/json" });

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.createCompany(data);
    const expected: IApiResultObject<IPlanhatCompany> = {
      data,
      endpoint: `https://api.planhat.com/companies`,
      method: "insert",
      record: data,
      success: true,
    };
    expect(actual).toEqual(expected);
  });

  test("should not throw if api returns status 500 to create company", async () => {
    const data: IPlanhatCompany = {
      externalId: "company1234",
      name: "Company 1234 Inc.",
      phase: "customer",
    };

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .post(`/companies`)
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.createCompany(data);
    const expected: IApiResultObject<IPlanhatCompany> = {
      data: undefined,
      endpoint: `https://api.planhat.com/companies`,
      method: "insert",
      record: data,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });

  test("should update an existing company and return success", async () => {
    const data: IPlanhatCompany = {
      id: "863969",
      externalId: "company1234",
      name: "Company 1234 Inc.",
      phase: "customer",
    };

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .put(`/companies/${data.id}`)
      .reply(200, data, { "Content-Type": "application/json" });

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.updateCompany(data);
    const expected: IApiResultObject<IPlanhatCompany> = {
      data,
      endpoint: `https://api.planhat.com/companies/${data.id}`,
      method: "update",
      record: data,
      success: true,
    };
    expect(actual).toEqual(expected);
  });

  test("should not throw if api returns status 500 to update company", async () => {
    const data: IPlanhatCompany = {
      id: "863969",
      externalId: "company1234",
      name: "Company 1234 Inc.",
      phase: "customer",
    };

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .put(`/companies/${data.id}`)
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.updateCompany(data);
    const expected: IApiResultObject<IPlanhatCompany> = {
      data: undefined,
      endpoint: `https://api.planhat.com/companies/${data.id}`,
      method: "update",
      record: data,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });

  test("should delete an existing company and return success", async () => {
    const dataId = "863969";

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .delete(`/companies/${dataId}`)
      .reply(204, {}, { "Content-Type": "application/json" });

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.deleteCompany(dataId);
    const expected: IApiResultObject<IPlanhatCompany> = {
      data: {},
      endpoint: `https://api.planhat.com/companies/${dataId}`,
      method: "delete",
      record: undefined,
      success: true,
      error: undefined,
    };
    expect(actual).toEqual(expected);
  });

  test("should not throw if api returns status 500 to delete company", async () => {
    const dataId = "863969";

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .delete(`/companies/${dataId}`)
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.deleteCompany(dataId);
    const expected: IApiResultObject<IPlanhatCompany> = {
      data: undefined,
      endpoint: `https://api.planhat.com/companies/${dataId}`,
      method: "delete",
      record: undefined,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });

  test("should track event and return success", async () => {
    const data: IPlanhatEvent = {
      action: "Account created",
      companyExternalId: "company1234",
      date: new Date().toISOString(),
      email: "test1@hull.io",
      externalId: "usr64593",
      name: "John Smith",
    };

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://analytics.planhat.com") // No authentication required for this one
      .post(`/analytics/${svcClientConfig.tenantId}`)
      .reply(201, {}, { "Content-Type": "application/json" });

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.trackEvent(data);
    const expected: IApiResultObject<IPlanhatEvent> = {
      data: {},
      endpoint: `https://analytics.planhat.com/analytics/${svcClientConfig.tenantId}`,
      method: "insert",
      record: data,
      success: true,
    };
    expect(actual).toEqual(expected);
  });

  test("should not throw if api returns status 500 when tracking events", async () => {
    const data: IPlanhatEvent = {
      action: "Account created",
      companyExternalId: "company1234",
      date: new Date().toISOString(),
      email: "test1@hull.io",
      externalId: "usr64593",
      name: "John Smith",
    };

    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://analytics.planhat.com") // No authentication required for this one
      .post(`/analytics/${svcClientConfig.tenantId}`)
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.trackEvent(data);
    const expected: IApiResultObject<IPlanhatEvent> = {
      data: undefined,
      endpoint: `https://analytics.planhat.com/analytics/${svcClientConfig.tenantId}`,
      method: "insert",
      record: data,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });

  it("should list all users", async () => {
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .get(`/users`)
      .reply(200, PlanhatUsersResponseData, {
        "Content-Type": "application/json",
      });

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.listUsers();
    const expected: IApiResultObject<PlanhatUser> = {
      data: PlanhatUsersResponseData,
      endpoint: `https://api.planhat.com/users`,
      method: "query",
      record: undefined,
      success: true,
      error: undefined,
    };
    expect(actual).toEqual(expected);
  });

  it("should not throw if api returns status 500 when listing users", async () => {
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .get(`/users`)
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.listUsers();
    const expected: IApiResultObject<PlanhatUser> = {
      data: undefined,
      endpoint: `https://api.planhat.com/users`,
      method: "query",
      record: undefined,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });

  it("should get a user by id", async () => {
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    // eslint-disable-next-line no-underscore-dangle
    const planhatId = PlanhatUserResponseData._id;

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .get(`/users/${planhatId}`)
      .reply(200, PlanhatUserResponseData, {
        "Content-Type": "application/json",
      });

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.getUserById(planhatId);
    const expected: IApiResultObject<PlanhatUser> = {
      data: PlanhatUserResponseData,
      endpoint: `https://api.planhat.com/users/${planhatId}`,
      method: "query",
      record: undefined,
      success: true,
      error: undefined,
    };
    expect(actual).toEqual(expected);
  });

  it("should not throw if api returns status 500 when getting a user by id", async () => {
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    // eslint-disable-next-line no-underscore-dangle
    const planhatId = PlanhatUserResponseData._id;

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .get(`/users/${planhatId}`)
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.getUserById(planhatId);
    const expected: IApiResultObject<PlanhatUser> = {
      data: undefined,
      endpoint: `https://api.planhat.com/users/${planhatId}`,
      method: "query",
      record: undefined,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });

  it("should create an user", async () => {
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    const payload: PlanhatUser = {
      email: "test@test.lv",
      externalId: "test",
      nickName: "test",
      firstName: "test",
      lastName: "test",
      roles: ["000000020000000000000000"],
    };

    const data = {
      _id: "5df0c011dbf1980b8715c91a",
      firstName: "test",
      lastName: "test",
      nickName: "test",
      email: "test@test.lv",
      roles: ["000000020000000000000000"],
      poc: [],
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .post(`/users`)
      .reply(200, data, {
        "Content-Type": "application/json",
      });

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.createUser(payload);
    const expected: IApiResultObject<PlanhatUser> = {
      data,
      endpoint: `https://api.planhat.com/users`,
      method: "insert",
      record: payload,
      success: true,
      error: undefined,
    };
    expect(actual).toEqual(expected);
  });

  it("should not throw if api returns status 500 when creating an user", async () => {
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    const payload: PlanhatUser = {
      email: "test@test.lv",
      externalId: "test",
      nickName: "test",
      firstName: "test",
      lastName: "test",
      roles: ["000000020000000000000000"],
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .post(`/users`)
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.createUser(payload);
    const expected: IApiResultObject<PlanhatUser> = {
      data: undefined,
      endpoint: `https://api.planhat.com/users`,
      method: "insert",
      record: payload,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });

  it("should update an user", async () => {
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    const payload: PlanhatUser = {
      email: "test2@test.lv",
      externalId: "test2",
      nickName: "test2",
      firstName: "test2",
      lastName: "test2",
    };

    const data = {
      _id: "5df0c011dbf1980b8715c91a",
      skippedGettingStartedSteps: {
        email: false,
        linkedin: false,
        avatar: false,
        all: false,
        team: false,
        customers: false,
      },
      sharedNotificationsPrefs: {
        enabled: [],
        disabled: [],
        disabledEvents: [],
      },
      image: {
        path: "",
      },
      firstName: "test2",
      lastName: "test2",
      isHidden: false,
      removed: false,
      inactive: false,
      compressedView: false,
      companyFilter: "",
      taskFilter: "",
      workflowFilter: "",
      playLogDisabled: true,
      radarOneLine: false,
      collapsedFolders: [],
      usageReportColumnsEnabled: [],
      companyUsersEnabledColumns: [],
      revReportPeriodType: "past x days",
      splitLayoutDisabled: false,
      dailyDigest: true,
      followerUpdate: true,
      inAppNotifications: true,
      lastVisitedCompanies: [],
      lastVisitedEndusers: [],
      roles: [
        {
          _id: "000000020000000000000000",
          name: "Manager",
          description: "Access to the entire portfolio, and all functionality",
          permissions: [
            "portfolio_profile_csmScore",
            "portfolio_profile_orgTree",
            "portfolio_addNewProfiles",
            "portfolio_profile_description",
            "portfolio_profile_coOwner",
            "portfolio_churn",
            "people_",
            "people_personas",
            "team_",
            "team_teams",
            "activities_",
            "activities_plays",
            "activities_playbooks",
            "activities_playbooks2",
            "activities_outreach",
            "activities_taskInbox",
            "activities_tickets",
            "revenue_reports_renewals",
            "revenue_fx",
            "revenue_revenueManagement",
            "usage_",
            "usage_reports_",
            "usage_analytics",
            "optys_",
            "health_",
            "health_multiProfile",
            "nps_",
            "nps_reports_",
            "data_accounts_teamAccess",
            "portfolio_segments",
            "nps_survey_",
            "health__UserTracks",
            "activities_emailOutbox",
            "portfolio_lifecycle",
            "core_softErrors",
            "data_export",
            "portfolio_changeOwner",
            "revenue_forecasting",
            "activities_calls",
            "revenue_nrr",
            "activities_new",
            "revenue_reports_",
            "revenue_",
            "ci_",
          ],
          __v: 35,
        },
      ],
      poc: [],
      isExposedAsSenderOption: false,
      defaultMeetingLength: 60,
      nickName: "test2",
      email: "test2@test.lv",
      createDate: "2019-12-11T10:08:17.182Z",
      __v: 0,
      permissions: {},
      recentOpenTabs: {},
      recentTabSearches: {},
      externalId: "test2",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      // eslint-disable-next-line no-underscore-dangle
      .put(`/users/${data._id}`)
      .reply(200, data, {
        "Content-Type": "application/json",
      });

    const svcClient = new PlanhatClient(svcClientConfig);
    // eslint-disable-next-line no-underscore-dangle
    const actual = await svcClient.updateUser(data._id, payload);
    const expected: IApiResultObject<PlanhatUser> = {
      data,
      // eslint-disable-next-line no-underscore-dangle
      endpoint: `https://api.planhat.com/users/${data._id}`,
      method: "update",
      record: payload,
      success: true,
      error: undefined,
    };
    expect(actual).toEqual(expected);
  });

  it("should not throw if api returns status 500 when updating an user", async () => {
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    const payload: PlanhatUser = {
      email: "test2@test.lv",
      externalId: "test2",
      nickName: "test2",
      firstName: "test2",
      lastName: "test2",
    };

    const planhatId = "5df0c011dbf1980b8715c91a";

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .put(`/users/${planhatId}`)
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.updateUser(planhatId, payload);
    const expected: IApiResultObject<PlanhatUser> = {
      data: undefined,
      endpoint: `https://api.planhat.com/users/${planhatId}`,
      method: "update",
      record: payload,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });

  it("should get a license by id", async () => {
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    // eslint-disable-next-line no-underscore-dangle
    const planhatId = PlanhatLicenseResponseData._id;
    const { companyId } = PlanhatLicenseResponseData;

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .get(`/companies/${companyId}/licenses/${planhatId}`)
      .reply(200, PlanhatLicenseResponseData, {
        "Content-Type": "application/json",
      });

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.getLicenseById(companyId, planhatId);
    const expected: IApiResultObject<PlanhatUser> = {
      data: PlanhatLicenseResponseData,
      endpoint: `https://api.planhat.com/companies/${companyId}/licenses/${planhatId}`,
      method: "query",
      record: undefined,
      success: true,
      error: undefined,
    };
    expect(actual).toEqual(expected);
  });

  it("should not throw if api returns status 500 when getting a license by id", async () => {
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    // eslint-disable-next-line no-underscore-dangle
    const planhatId = PlanhatLicenseResponseData._id;
    const { companyId } = PlanhatLicenseResponseData;

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .get(`/companies/${companyId}/licenses/${planhatId}`)
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.getLicenseById(companyId, planhatId);
    const expected: IApiResultObject<PlanhatUser> = {
      data: undefined,
      endpoint: `https://api.planhat.com/companies/${companyId}/licenses/${planhatId}`,
      method: "query",
      record: undefined,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });

  it("should create a license", async () => {
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    const payload: PlanhatLicense = {
      product: "License Fee",
      _currency: "USD",
      fromDate: "2019-12-11T11:46:08+02:00",
      toDate: "2020-12-11T11:46:08+02:00",
      fixedPeriod: true,
      renewalUnit: "month",
      noticePeriod: 30,
      noticeUnit: "day",
      invoiceCycleInterval: 0,
      companyId: "5df351075691162818a53458",
      fcNewStartDate: "",
      mrr: 1250,
      invoiceCycle: "yearly",
    };

    const data = {
      renewalStatus: "ongoing",
      issues: [],
      autoRenews: false,
      noticePeriod: 30,
      renewalUnit: "month",
      noticeUnit: "day",
      invoicesGenerated: false,
      _id: "5df0b2346c7e8e21d74136e0",
      product: "License Fee",
      _currency: "USD",
      fromDate: "2019-12-11T09:09:08.000Z",
      toDate: "2020-12-11T09:09:08.000Z",
      fixedPeriod: true,
      invoiceCycleInterval: 0,
      companyId: "5df0afda6c7e8e21d74136db",
      fcNewStartDate: null,
      mrr: 1250,
      invoiceCycle: "yearly",
      toDateIncluded: false,
      length: 12,
      value: 15000,
      renewalPeriod: 12,
      renewalDate: "2020-12-11T09:09:08.000Z",
      renewalDaysFromNow: 365,
      isOverdue: false,
      __v: 0,
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .post(`/companies/${payload.companyId}/licenses`)
      .reply(200, data, {
        "Content-Type": "application/json",
      });

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.createLicense(
      payload.companyId as string,
      payload,
    );
    const expected: IApiResultObject<PlanhatLicense> = {
      data,
      endpoint: `https://api.planhat.com/companies/${payload.companyId}/licenses`,
      method: "insert",
      record: payload,
      success: true,
      error: undefined,
    };
    expect(actual).toEqual(expected);
  });

  it("should not throw if api returns status 500 when creating a license", async () => {
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    const payload: PlanhatLicense = {
      product: "License Fee",
      _currency: "USD",
      fromDate: "2019-12-11T11:46:08+02:00",
      toDate: "2020-12-11T11:46:08+02:00",
      fixedPeriod: true,
      renewalUnit: "month",
      noticePeriod: 30,
      noticeUnit: "day",
      invoiceCycleInterval: 0,
      companyId: "5df351075691162818a53458",
      fcNewStartDate: "",
      mrr: 1250,
      invoiceCycle: "yearly",
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .post(`/companies/${payload.companyId}/licenses`)
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.createLicense(
      payload.companyId as string,
      payload,
    );
    const expected: IApiResultObject<PlanhatLicense> = {
      data: undefined,
      endpoint: `https://api.planhat.com/companies/${payload.companyId}/licenses`,
      method: "insert",
      record: payload,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });

  it("should update a license", async () => {
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    const payload: PlanhatLicense = {
      autoRenews: true,
      noticePeriod: 14,
      renewalUnit: "month",
      noticeUnit: "day",
      invoicesGenerated: false,
      product: "License Fee 2",
      fromDate: "2019-12-15T09:09:08.000Z",
      toDate: "2020-12-15T09:09:08.000Z",
      fixedPeriod: false,
      invoiceCycleInterval: 0,
      mrr: 1300,
    };

    const data = {
      _id: "5df0b2346c7e8e21d74136e0",
      renewalStatus: "ongoing",
      issues: [],
      autoRenews: null,
      noticePeriod: 14,
      renewalUnit: null,
      noticeUnit: "day",
      invoicesGenerated: false,
      product: "License Fee 2",
      _currency: "USD",
      fromDate: "2019-12-15T09:09:08.000Z",
      toDate: null,
      fixedPeriod: false,
      invoiceCycleInterval: 0,
      companyId: "5df0afda6c7e8e21d74136db",
      fcNewStartDate: null,
      mrr: 1300,
      invoiceCycle: "yearly",
      toDateIncluded: false,
      length: null,
      value: null,
      renewalPeriod: null,
      renewalDate: null,
      renewalDaysFromNow: null,
      isOverdue: false,
      __v: 0,
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      // eslint-disable-next-line no-underscore-dangle
      .put(`/companies/${data.companyId}/licenses/${data._id}`)
      .reply(200, data, {
        "Content-Type": "application/json",
      });

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.updateLicense(
      data.companyId as string,
      // eslint-disable-next-line no-underscore-dangle
      data._id,
      payload,
    );
    const expected: IApiResultObject<PlanhatLicense> = {
      data,
      // eslint-disable-next-line no-underscore-dangle
      endpoint: `https://api.planhat.com/companies/${data.companyId}/licenses/${data._id}`,
      method: "update",
      record: payload,
      success: true,
      error: undefined,
    };
    expect(actual).toEqual(expected);
  });

  it("should not throw if api returns status 500 when updating a license", async () => {
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    const payload: PlanhatLicense = {
      autoRenews: true,
      noticePeriod: 14,
      renewalUnit: "month",
      noticeUnit: "day",
      invoicesGenerated: false,
      product: "License Fee 2",
      fromDate: "2019-12-15T09:09:08.000Z",
      toDate: "2020-12-15T09:09:08.000Z",
      fixedPeriod: false,
      invoiceCycleInterval: 0,
      mrr: 1300,
    };

    const data = {
      _id: "5df0b2346c7e8e21d74136e0",
      renewalStatus: "ongoing",
      issues: [],
      autoRenews: null,
      noticePeriod: 14,
      renewalUnit: null,
      noticeUnit: "day",
      invoicesGenerated: false,
      product: "License Fee 2",
      _currency: "USD",
      fromDate: "2019-12-15T09:09:08.000Z",
      toDate: null,
      fixedPeriod: false,
      invoiceCycleInterval: 0,
      companyId: "5df0afda6c7e8e21d74136db",
      fcNewStartDate: null,
      mrr: 1300,
      invoiceCycle: "yearly",
      toDateIncluded: false,
      length: null,
      value: null,
      renewalPeriod: null,
      renewalDate: null,
      renewalDaysFromNow: null,
      isOverdue: false,
      __v: 0,
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      // eslint-disable-next-line no-underscore-dangle
      .put(`/companies/${data.companyId}/licenses/${data._id}`)
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.updateLicense(
      data.companyId as string,
      // eslint-disable-next-line no-underscore-dangle
      data._id,
      payload,
    );
    const expected: IApiResultObject<PlanhatLicense> = {
      data: undefined,
      // eslint-disable-next-line no-underscore-dangle
      endpoint: `https://api.planhat.com/companies/${data.companyId}/licenses/${data._id}`,
      method: "update",
      record: payload,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });

  it("should bulk upserts licenses", async () => {
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    const payload: PlanhatLicense[] = [
      {
        product: "License Fee",
        _currency: "USD",
        fromDate: "2019-12-11T11:46:08+02:00",
        toDate: "2020-12-11T11:46:08+02:00",
        fixedPeriod: true,
        renewalUnit: "month",
        noticePeriod: 30,
        noticeUnit: "day",
        invoiceCycleInterval: 0,
        companyId: "5df351075691162818a53458",
        fcNewStartDate: "",
        mrr: 1250,
        invoiceCycle: "yearly",
      },
      {
        product: "License Fee",
        _currency: "USD",
        fromDate: "2019-12-11T11:46:08+02:00",
        toDate: "2020-12-11T11:46:08+02:00",
        fixedPeriod: true,
        renewalUnit: "month",
        noticePeriod: 14,
        noticeUnit: "day",
        invoiceCycleInterval: 0,
        companyId: "5df351075691162818a53458",
        fcNewStartDate: "",
        mrr: 1250,
        invoiceCycle: "monthly",
      },
    ];

    const data = {
      created: 2,
      createdErrors: [],
      insertsKeys: [
        {
          _id: "5e2704aabf07307b89e48d6a",
        },
        {
          _id: "5e2704aabf07307b89e48d6b",
        },
      ],
      updated: 0,
      updatedErrors: [],
      updatesKeys: [],
      nonupdates: 0,
      modified: [],
      upsertedIds: ["5e2704aabf07307b89e48d6a", "5e2704aabf07307b89e48d6b"],
    };

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .put(`/licenses`)
      .reply(200, data, {
        "Content-Type": "application/json",
      });

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.bulkUpsertLicenses(payload);
    const expected: IApiResultObject<PlanhatLicense[]> = {
      data,
      // eslint-disable-next-line no-underscore-dangle
      endpoint: `https://api.planhat.com/licenses`,
      method: "bulkUpsert",
      record: payload,
      success: true,
      error: undefined,
    };
    expect(actual).toEqual(expected);
  });

  it("should not throw if api returns status 500 when bulk upserting licenses", async () => {
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    const payload: PlanhatLicense[] = [
      {
        product: "License Fee",
        _currency: "USD",
        fromDate: "2019-12-11T11:46:08+02:00",
        toDate: "2020-12-11T11:46:08+02:00",
        fixedPeriod: true,
        renewalUnit: "month",
        noticePeriod: 30,
        noticeUnit: "day",
        invoiceCycleInterval: 0,
        companyId: "5df351075691162818a53458",
        fcNewStartDate: "",
        mrr: 1250,
        invoiceCycle: "yearly",
      },
      {
        product: "License Fee",
        _currency: "USD",
        fromDate: "2019-12-11T11:46:08+02:00",
        toDate: "2020-12-11T11:46:08+02:00",
        fixedPeriod: true,
        renewalUnit: "month",
        noticePeriod: 14,
        noticeUnit: "day",
        invoiceCycleInterval: 0,
        companyId: "5df351075691162818a53458",
        fcNewStartDate: "",
        mrr: 1250,
        invoiceCycle: "monthly",
      },
    ];

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      .put(`/licenses`)
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.bulkUpsertLicenses(payload);
    const expected: IApiResultObject<PlanhatLicense[]> = {
      data: undefined,
      // eslint-disable-next-line no-underscore-dangle
      endpoint: `https://api.planhat.com/licenses`,
      method: "bulkUpsert",
      record: payload,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });

  it("should delete a license", async () => {
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    const data = {
      n: 1,
      ok: 1,
    };

    const companyId = "5df351075691162818a53458";
    const planhatId = "5df0bae0cc601f226cc09df6";

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      // eslint-disable-next-line no-underscore-dangle
      .delete(`/companies/${companyId}/licenses/${planhatId}`)
      .reply(200, data, {
        "Content-Type": "application/json",
      });

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.deleteLicense(companyId, planhatId);
    const expected: IApiResultObject<PlanhatLicense> = {
      data,
      // eslint-disable-next-line no-underscore-dangle
      endpoint: `https://api.planhat.com/companies/${companyId}/licenses/${planhatId}`,
      method: "delete",
      record: undefined,
      success: true,
      error: undefined,
    };
    expect(actual).toEqual(expected);
  });

  it("should not throw if api returns status 500 when deleting a license", async () => {
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: "yp42nhyhAKFLUSg5y4u0w==",
      apiPrefix: "api",
      tenantId: "py3h8hbrn",
    };

    const companyId = "5df351075691162818a53458";
    const planhatId = "5df0bae0cc601f226cc09df6";

    nock("https://api.planhat.com")
      .matchHeader("authorization", `Bearer ${svcClientConfig.accessToken}`)
      // eslint-disable-next-line no-underscore-dangle
      .delete(`/companies/${companyId}/licenses/${planhatId}`)
      .replyWithError("Some arbitrary error");

    const svcClient = new PlanhatClient(svcClientConfig);
    const actual = await svcClient.deleteLicense(companyId, planhatId);
    const expected: IApiResultObject<PlanhatLicense> = {
      data: undefined,
      // eslint-disable-next-line no-underscore-dangle
      endpoint: `https://api.planhat.com/companies/${companyId}/licenses/${planhatId}`,
      method: "delete",
      record: undefined,
      success: false,
      error: ["Some arbitrary error"],
    };
    expect(actual).toEqual(expected);
  });
});
