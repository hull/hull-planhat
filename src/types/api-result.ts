export type ApiMethod = "query" | "insert" | "update" | "delete" | "bulkUpsert";

// eslint-disable-next-line import/no-default-export
export default interface ApiResultObject<T> {
  endpoint: string;
  method: ApiMethod;
  record: T | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  success: boolean;
  error?: string | string[];
}
