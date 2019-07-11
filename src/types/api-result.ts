export default interface IApiResultObject<T> {
    endpoint: string;
    method: "query" | "insert" | "update" | "delete";
    record: T | undefined;
    data: any;
    success: boolean;
    error?: string | string[];
  }