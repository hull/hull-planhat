import IHullAccount from "./account";

export interface IPlanhatAccountDictionaryItem {
    hullId: string;
    hullExternalId?: string;
    hullProfile: IHullAccount;
    serviceId?: string;
}

export interface IPlanhatAccountDictionary {
    [key: string]: IPlanhatAccountDictionaryItem;
}