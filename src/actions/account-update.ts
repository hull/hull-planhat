import IHullAccountUpdateMessage from "../types/account-update-message";
import SyncAgent from "../core/sync-agent";

/* eslint-disable @typescript-eslint/no-explicit-any */
const accountUpdateHandlerFactory = (
  options: any = {},
): ((ctx: any, messages: IHullAccountUpdateMessage[]) => Promise<any>) => {
  const { flowControl = null, isBatch = false } = options;
  return function accountUpdateHandler(
    ctx: any,
    messages: IHullAccountUpdateMessage[],
  ): Promise<any> {
    if (ctx.smartNotifierResponse && flowControl) {
      ctx.smartNotifierResponse.setFlowControl(flowControl);
    }

    try {
      const agent = new SyncAgent(ctx.client, ctx.ship, ctx.metric);

      if (messages.length > 0) {
        return agent.sendAccountMessages(messages, isBatch);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }

    return Promise.resolve();
  };
};

/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line import/no-default-export
export default accountUpdateHandlerFactory;
