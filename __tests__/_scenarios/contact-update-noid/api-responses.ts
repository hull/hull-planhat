import nock from "nock";
import { Url } from "url";
import { API_PREFIX, PERSONAL_ACCESS_TOKEN } from "../../_helpers/constants";
import { IPlanhatContact, IPlanhatCompany } from "../../../src/core/planhat-objects";

const setupApiMockResponses = (nockFn: (basePath: string | RegExp | Url, options?: nock.Options | undefined) => nock.Scope) => {
    const dataCreatedContact: IPlanhatContact = {
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
    };

    const dataSearch = [
        {
            "_id": "5d81eb28aeeafc7a74d8f999",
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
            "companyId": "1234",
            "name": "John Miller",
            "email": "test1@hull.io",
            "firstName": "John",
            "lastName": "Miller",
            "companyName": "Test 1234 Inc.",
            "createDate": "2019-09-18T08:30:32.032Z",
            "relatedEndusers": [],
            "emailMd5": "53d22e4afda071779fafc63ba1433906",
            "__v": 0,
            "relevance": 0
        }
    ];
    
    nockFn(`https://${API_PREFIX}.planhat.com`)
    .matchHeader('authorization', `Bearer ${PERSONAL_ACCESS_TOKEN}`)
    .get(`/endusers?email=${dataCreatedContact.email}`)
    .reply(200, dataSearch, { 'Content-Type': 'application/json' });
    
    nockFn(`https://${API_PREFIX}.planhat.com`)
    .matchHeader('authorization', `Bearer ${PERSONAL_ACCESS_TOKEN}`)
    .put("/endusers/5d81eb28aeeafc7a74d8f999")
    .reply(200, dataCreatedContact, { 'Content-Type': 'application/json' });
}

export default setupApiMockResponses;