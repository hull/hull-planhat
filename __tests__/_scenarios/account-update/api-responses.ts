import nock from "nock";
import { Url } from "url";
import { API_PREFIX, PERSONAL_ACCESS_TOKEN } from "../../_helpers/constants";
import { IPlanhatCompany } from "../../../src/core/planhat-objects";

const setupApiMockResponses = (nockFn: (basePath: string | RegExp | Url, options?: nock.Options | undefined) => nock.Scope) => {

    const dataCreatedCompany: IPlanhatCompany = {
        _id: "1234",
        name: "Test 1234",
        slug: "test1234inc",
        "shareable": {
            "enabled": false,
            "euIds": [],
            "sunits": false
        },
        "followers": [],
        "domains": [],
        "collaborators": [],
        "products": [],
        "tags": [],
        "lastPerformedTriggers": [],
        "createDate": "2019-09-18T08:16:31.223Z",
        "lastUpdated": "2019-09-18T08:16:31.223Z",
        "lastTouchByType": {},
        "sales": [],
        "licenses": [],
        "features": {},
        "sunits": {},
        "usage": {},
        "csmScoreLog": [],
        "documents": [],
        "links": [],
        "alerts": [],
        "lastActivities": [],
        "nrr30": 0,
        "nrrTotal": 0,
        "mrrTotal": 0,
        "mrr": 0,
        "status": "prospect",
        "mr": 0,
        "mrTotal": 0,
        "__v": 0
    };

    const dataGetCompany = {
        "_id": "1234",
        "shareable": {
            "team": {
                "fields": []
            },
            "enabled": false,
            "euIds": [],
            "sunits": false
        },
        "followers": [],
        "domains": [],
        "collaborators": [],
        "products": [],
        "tags": [],
        "lastPerformedTriggers": [],
        "name": "Test 1234 Inc.",
        "slug": "test1234inc",
        "createDate": "2019-10-02T10:50:48.930Z",
        "lastUpdated": "2019-10-02T10:50:48.930Z",
        "lastTouchByType": {},
        "sales": [],
        "licenses": [],
        "features": {},
        "sunits": {},
        "usage": {},
        "csmScoreLog": [],
        "documents": [],
        "links": [],
        "alerts": [],
        "lastActivities": [],
        "nrr30": 0,
        "nrrTotal": 0,
        "renewalDate": null,
        "renewalDaysFromNow": null,
        "autoRenews": null,
        "headId": null,
        "customerTo": null,
        "mrrTotal": 0,
        "mrr": 0,
        "customerFrom": null,
        "status": "prospect",
        "mr": 0,
        "mrTotal": 0,
        "__v": 0,
        "h": 5,
        "hProfile": "5d3f2c6d62e03e47205afcb0",
        "orgPathCount": 0
    };

    nockFn(`https://${API_PREFIX}.planhat.com`)
    .matchHeader('authorization', `Bearer ${PERSONAL_ACCESS_TOKEN}`)
    .put("/companies/1234")
    .reply(200, dataCreatedCompany, { 'Content-Type': 'application/json' });

    nockFn(`https://${API_PREFIX}.planhat.com`)
    .matchHeader('authorization', `Bearer ${PERSONAL_ACCESS_TOKEN}`)
    .get("/companies/1234")
    .reply(200, dataGetCompany, { 'Content-Type': 'application/json' });
}

export default setupApiMockResponses;
