import IHullUserUpdateMessage from "../types/user-update-message";
import IHullAccountUpdateMessage from "../types/account-update-message";

export interface IPlanhatCompany {
    id?: string;
    name: string | undefined;
    slug?: string;
    externalId?: string;
    phase?: string;
    tags?: string[];
    custom?: any;
}

export interface IPlanhatContact {
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
    custom?: any;
}

export interface IPlanhatEvent {
    name: string | undefined;
    email?: string;
    externalId?: string;
    companyExternalId?: string;
    date?: Date | string;
    action: string | undefined;
    info?: any;
}

export interface IOperationEnvelope<T> {
    msg: IHullUserUpdateMessage | IHullAccountUpdateMessage;
    serviceObject?: T;
    operation: "insert" | "update" | "skip";
    reason?: string;
}