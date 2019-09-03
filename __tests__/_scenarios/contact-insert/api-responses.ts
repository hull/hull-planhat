import nock from "nock";
import { Url } from "url";
import { API_PREFIX, PERSONAL_ACCESS_TOKEN } from "../../_helpers/constants";
import { IPlanhatContact } from "../../../src/core/planhat-objects";

const setupApiMockResponses = (nockFn: (basePath: string | RegExp | Url, options?: nock.Options | undefined) => nock.Scope) => {
    const dataCreatedContact: IPlanhatContact = {
        companyId: "vhoih28[hbnjnmwjnjbfoho",
        createDate: new Date(1563804862).toISOString(),
        email: "test1@hull.io",
        name: "John Miller"
    };
    
    nockFn(`https://${API_PREFIX}.planhat.com`)
    .matchHeader('authorization', `Bearer ${PERSONAL_ACCESS_TOKEN}`)
    .get(`/endusers?email=${dataCreatedContact.email}`)
    .reply(200, { data: [] }, { 'Content-Type': 'application/json' });
    
    nockFn(`https://${API_PREFIX}.planhat.com`)
    .matchHeader('authorization', `Bearer ${PERSONAL_ACCESS_TOKEN}`)
    .post("/endusers")
    .reply(200, dataCreatedContact, { 'Content-Type': 'application/json' });
}

export default setupApiMockResponses;