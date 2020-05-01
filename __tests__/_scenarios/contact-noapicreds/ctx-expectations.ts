import { ContextMock } from "../../_helpers/mocks";

const setupExpectations = (ctx: ContextMock): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((ctx.client.logger.info as any).mock.calls).toHaveLength(0);
};

// eslint-disable-next-line import/no-default-export
export default setupExpectations;
