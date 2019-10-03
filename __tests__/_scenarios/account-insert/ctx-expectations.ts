import _ from "lodash";
import { ContextMock } from "../../_helpers/mocks";
import { API_PREFIX } from "../../_helpers/constants";


const setupExpectations = (ctx: ContextMock) => {
    expect((ctx.client.logger.info as any).mock.calls).toHaveLength(1);
    expect((ctx.client.logger.info as any).mock.calls[0])
    .toEqual(["outgoing.account.success", { 
      "data": {
        _id: '1234',
           name: 'Test 1234 Inc.',
           slug: 'test1234inc',
           shareable: { enabled: false, euIds: [], sunits: false },
           followers: [],
           domains: [],
           collaborators: [],
           products: [],
           tags: [],
           lastPerformedTriggers: [],
           createDate: '2019-09-18T08:16:31.223Z',
           lastUpdated: '2019-09-18T08:16:31.223Z',
           lastTouchByType: {},
           sales: [],
           licenses: [],
           features: {},
           sunits: {},
           usage: {},
           csmScoreLog: [],
           documents: [],
           links: [],
           alerts: [],
           lastActivities: [],
           nrr30: 0,
           nrrTotal: 0,
           mrrTotal: 0,
           mrr: 0,
           status: 'prospect',
           mr: 0,
           mrTotal: 0,
           __v: 0
      }, 
      "endpoint": "https://api.planhat.com/companies", 
      "error": undefined, 
      "method": "insert", 
      "record": {
        "name": "Test 1234 Inc."
      }, 
      "success": true
    }]);
};

export default setupExpectations;