import IHullUserUpdateMessage from "../types/user-update-message";
import SyncAgent from "../core/sync-agent";

/* eslint-disable @typescript-eslint/no-explicit-any */
const userUpdateHandlerFactory = (
  options: any = {},
): ((ctx: any, messages: IHullUserUpdateMessage[]) => Promise<any>) => {
  const { flowControl = null, isBatch = false } = options;
  return function userUpdateHandler(
    ctx: any,
    messages: IHullUserUpdateMessage[],
  ): Promise<any> {
    if (ctx.smartNotifierResponse && flowControl) {
      ctx.smartNotifierResponse.setFlowControl(flowControl);
    }
    const agent = new SyncAgent(ctx.client, ctx.ship, ctx.metric);

    if (messages.length > 0) {
      return agent.sendUserMessages(messages, isBatch);
    }
    return Promise.resolve();
  };
};

/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line import/no-default-export
export default userUpdateHandlerFactory;
