import IHullUserUpdateMessage from "../types/user-update-message";
import IHullAccountUpdateMessage from "../types/account-update-message";

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IPlanhatCompany {
  _id?: string;
  id?: string;
  name: string | undefined;
  slug?: string;
  owner?: string;
  coOwner?: string;
  externalId?: string;
  phase?: string;
  tags?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  custom?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [propName: string]: any; // Only in responses from the API
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IPlanhatContact {
  _id?: string;
  id?: string;
  companyId: string | undefined;
  companyName?: string;
  createDate?: Date | string;
  externalId?: string;
  name?: string;
  position?: string;
  phone?: string;
  email?: string;
  featured?: boolean;
  tags?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  custom?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [propName: string]: any; // Only in responses from the API
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IPlanhatEvent {
  name: string | undefined;
  email?: string;
  externalId?: string;
  companyExternalId?: string;
  date?: Date | string;
  action: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info?: any;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IOperationEnvelope<T> {
  msg: IHullUserUpdateMessage | IHullAccountUpdateMessage;
  serviceObject?: T;
  operation: "insert" | "update" | "skip";
  reason?: string;
}

export interface PlanhatUser {
  _id?: string;
  email: string | undefined | null;
  externalId?: string;
  nickName: string;
  firstName: string;
  lastName: string;
  roles?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [propName: string]: any; // Only in responses from the API
}

export interface PlanhatLicense {
  _id?: string;
  externalId?: string;
  product?: string;
  _currency?: string;
  fromDate: string;
  toDate?: string;
  fixedPeriod?: boolean;
  mrr?: number;
  value?: number;
  renewalStatus?: "ongoing" | "renewed" | "lost";
  autoRenews?: boolean;
  renewalPeriod?: number;
  noticePeriod?: number;
  companyId?: string; // Only required for bulk upserts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  custom?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [propName: string]: any; // Only in responses from the API
}

export interface BulkUpsertResponse {
  created: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdErrors: any[];
  insertsKeys: BulkUpsertKey[];
  updated: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatedErrors: any[];
  updatesKeys: BulkUpsertKey[];
  nonupdates: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modified: any[];
  upsertedIds: string[];
}

export interface BulkUpsertKey {
  _id: string;
}

export type PlanhatObjectTypeIncoming = "endusers" | "companies";

export interface IncomingFetchJob {
  objectType: "endusers" | "companies";
  startDate: string;
  endDate: string | undefined;
  offset: number;
  limit: number;
  lastActivity: string;
  filterStart: string;
  totalRecords: number;
  importedRecords: number;
}
