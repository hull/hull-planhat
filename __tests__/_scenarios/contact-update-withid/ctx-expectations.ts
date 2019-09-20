import _ from "lodash";
import { ContextMock } from "../../_helpers/mocks";
import { API_PREFIX } from "../../_helpers/constants";


const setupExpectations = (ctx: ContextMock) => {
    expect((ctx.client.logger.info as any).mock.calls).toHaveLength(1);
    expect((ctx.client.logger.info as any).mock.calls[0])
    .toEqual(["outgoing.user.success", {
      endpoint: `https://${API_PREFIX}.planhat.com/endusers/5d81eb28aeeafc7a74d8f999`,
      data: {
        companyId: "1234",
        createDate: new Date(1563804862).toISOString(),
        email: "test1@hull.io",
        name: "John Miller",
        "otherEmails": [],
        "featured": false,
        "tags": [],
        "personas": [],
        "npsUnsubscribed": false,
        "beatTrend": 0,
        "beats": 0,
        "convs14": 0,
        "convsTotal": 0,
        "beatsTotal": 0,
        "experience": 0,
        "_id": "5d81eb28aeeafc7a74d8f999",
        "firstName": "John",
        "lastName": "Miller",
        "companyName": "Test 1234 Inc.",
        "lastActivities": [],
        "relatedEndusers": [],
        "emailMd5": "53d22e4afda071779fafc63ba1433906",
        "__v": 0
      },
      record: {
        companyId: "1234",
        email: "test1@hull.io",
        name: "John Miller",
        id: "5d81eb28aeeafc7a74d8f999"
      },
      success: true,
      method: "update",
      error: undefined
    }]);
};

export default setupExpectations;