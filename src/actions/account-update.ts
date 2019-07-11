import _ from "lodash";
import IHullAccountUpdateMessage from "../types/account-update-message";
import SyncAgent from "../core/sync-agent";

const accountUpdateHandlerFactory = (options: any = {}): (ctx: any, messages: IHullAccountUpdateMessage[]) => Promise<any> => {
    const {
        flowControl = null,
        isBatch = false
    } = options;
    return function accountUpdateHandler(ctx: any, messages: IHullAccountUpdateMessage[]): Promise<any> {
        if (ctx.smartNotifierResponse && flowControl) {
            ctx.smartNotifierResponse.setFlowControl(flowControl);
        }
        
        const agent = new SyncAgent(ctx.client, ctx.ship, ctx.metric);

        if (messages.length > 0) {
            return agent.sendAccountMessages(messages, isBatch);
        }

        return Promise.resolve();
    };
}

export default accountUpdateHandlerFactory;
