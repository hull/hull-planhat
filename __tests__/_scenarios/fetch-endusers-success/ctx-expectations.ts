import { ContextMock } from "../../_helpers/mocks";
import PlanhatEndusersResponse from "../../_data/planhat-endusers.json";

/* eslint-disable @typescript-eslint/no-explicit-any */
const setupExpectations = (ctx: ContextMock): void => {
  expect((ctx.client.logger.info as any).mock.calls).toHaveLength(4);
  expect((ctx.client.logger.info as any).mock.calls[0][0]).toEqual(
    "incoming.job.start",
  );
  expect((ctx.client.logger.info as any).mock.calls[0][1]).toMatchObject({
    offset: 0,
    limit: 100,
    totalRecords: 0,
    importedRecords: 0,
  });
  expect((ctx.client.logger.info as any).mock.calls[1][0]).toEqual(
    "incoming.job.progress",
  );
  expect((ctx.client.logger.info as any).mock.calls[1][1]).toMatchObject({
    offset: 0,
    limit: 100,
    totalRecords: 0,
    importedRecords: 0,
  });
  expect((ctx.client.logger.info as any).mock.calls[2]).toEqual([
    "incoming.user.success",
    {
      data: PlanhatEndusersResponse[0],
    },
  ]);
  expect((ctx.client.logger.info as any).mock.calls[3][0]).toEqual(
    "incoming.job.success",
  );
  expect((ctx.client.logger.info as any).mock.calls[3][1]).toMatchObject({
    offset: 100,
    limit: 100,
    totalRecords: 1,
    importedRecords: 1,
  });
};

/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line import/no-default-export
export default setupExpectations;
