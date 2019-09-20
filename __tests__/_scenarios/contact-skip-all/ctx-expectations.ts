import _ from "lodash";
import { ContextMock } from "../../_helpers/mocks";

const setupExpectations = (ctx: ContextMock) => {
    expect((ctx.client.logger.info as any).mock.calls).toHaveLength(0);
};

export default setupExpectations;