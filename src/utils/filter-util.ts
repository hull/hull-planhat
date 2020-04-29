import _ from "lodash";
import { DateTime } from "luxon";
import PrivateSettings from "../types/private-settings";
import IHullUserUpdateMessage from "../types/user-update-message";
import IHullUserEvent from "../types/user-event";
import IHullAccountUpdateMessage from "../types/account-update-message";
import {
  IOperationEnvelope,
  IPlanhatContact,
  IPlanhatCompany,
  PlanhatUser,
} from "../core/planhat-objects";

class FilterUtil {
  private contactSegments: string[];

  private contactEvents: string[];

  private accountSegments: string[];

  private accountRequireExternalId: boolean;

  private planhatUsers: PlanhatUser[];

  constructor(privateSettings: PrivateSettings, planhatUsers: PlanhatUser[]) {
    this.contactSegments = privateSettings.contact_synchronized_segments;
    this.contactEvents = privateSettings.contact_events;
    this.accountSegments = privateSettings.account_synchronized_segments;
    this.accountRequireExternalId = privateSettings.account_require_externalid;
    this.planhatUsers = planhatUsers;
  }

  public filterUserMessages(
    messages: IHullUserUpdateMessage[],
    isBatch = false,
  ): Array<IOperationEnvelope<IPlanhatContact>> {
    const envelopes: Array<IOperationEnvelope<IPlanhatContact>> = [];
    if (isBatch === true) {
      _.forEach(messages, (message: IHullUserUpdateMessage) => {
        envelopes.push({
          msg: message,
          operation: "insert",
        });
      });
    } else {
      _.forEach(messages, (message: IHullUserUpdateMessage) => {
        const messageSegmentIds = message.segments.map(s => s.id);
        if (
          _.intersection(messageSegmentIds, this.contactSegments).length > 0
        ) {
          envelopes.push({
            msg: message,
            operation: "insert",
          });
        } else {
          envelopes.push({
            msg: message,
            operation: "skip",
            reason:
              "User doesn't belong to any of the segments defined in the Contact Filter.",
          });
        }
      });
    }
    return envelopes;
  }

  // eslint-disable-next-line class-methods-use-this
  public filterContactEnvelopes(
    envelopes: Array<IOperationEnvelope<IPlanhatContact>>,
  ): Array<IOperationEnvelope<IPlanhatContact>> {
    _.forEach(envelopes, (envelope: IOperationEnvelope<IPlanhatContact>) => {
      const contact = envelope.serviceObject as IPlanhatContact;
      let op = envelope.operation;
      let reason = "";
      if (contact.companyId === undefined) {
        op = "skip";
        reason = "No company id present.";
      }

      if (contact.email === undefined && contact.externalId === undefined) {
        op = "skip";
        reason += " Neither email nor external id present.";
      }

      reason = _.trim(reason);
      // eslint-disable-next-line no-param-reassign
      envelope.operation = op;
      if (op === "skip" && reason.length > 0) {
        // eslint-disable-next-line no-param-reassign
        envelope.reason = reason;
      }
    });

    return envelopes;
  }

  public filterMessagesWithEvent(
    messages: IHullUserUpdateMessage[],
  ): IHullUserUpdateMessage[] {
    const filteredMessages = _.filter(messages, (m: IHullUserUpdateMessage) => {
      if (!m.events || (m.events && m.events.length === 0)) {
        return false;
      }
      return _.some(m.events, (e: IHullUserEvent) =>
        _.includes(this.contactEvents, e.event),
      );
    });

    return filteredMessages;
  }

  public filterEvents(events: IHullUserEvent[]): IHullUserEvent[] {
    return _.filter(events, (evt: IHullUserEvent) => {
      return _.includes(this.contactEvents, evt.event);
    });
  }

  public filterAccountMessages(
    messages: IHullAccountUpdateMessage[],
    isBatch = false,
  ): Array<IOperationEnvelope<IPlanhatCompany>> {
    const envelopes: Array<IOperationEnvelope<IPlanhatCompany>> = [];

    if (isBatch === true) {
      if (this.accountRequireExternalId === true) {
        _.forEach(messages, (message: IHullAccountUpdateMessage) => {
          if (_.get(message, "account.external_id", undefined) === undefined) {
            envelopes.push({
              msg: message,
              operation: "skip",
              reason:
                "The account in Hull has no external_id, but it is marked as required.",
            });
          } else {
            envelopes.push({
              msg: message,
              operation: "insert",
            });
          }
        });
      } else {
        _.forEach(messages, (message: IHullAccountUpdateMessage) => {
          envelopes.push({
            msg: message,
            operation: "insert",
          });
        });
      }
    } else {
      _.forEach(messages, (message: IHullAccountUpdateMessage) => {
        const messageSegmentIds = message.account_segments.map(s => s.id);
        let op: "insert" | "update" | "skip" = "insert";
        let reason = "";
        if (
          this.accountRequireExternalId === true &&
          _.get(message, "account.external_id", undefined) === undefined
        ) {
          op = "skip";
          reason =
            "The account in Hull has no external_id, but it is marked as required.";
        }

        if (
          _.intersection(messageSegmentIds, this.accountSegments).length === 0
        ) {
          op = "skip";
          reason +=
            " Account doesn't belong to any of the segments defined in the Account Filter.";
        }

        reason = reason.trim();
        const envelope = {
          msg: message,
          operation: op,
        };
        if (op === "skip") {
          _.set(envelope, "reason", reason);
        }

        envelopes.push(envelope);
      });
    }

    return envelopes;
  }

  public filterCompanyEnvelopes(
    envelopes: Array<IOperationEnvelope<IPlanhatCompany>>,
  ): Array<IOperationEnvelope<IPlanhatCompany>> {
    _.forEach(envelopes, (envelope: IOperationEnvelope<IPlanhatCompany>) => {
      const company = envelope.serviceObject as IPlanhatCompany;
      let op = envelope.operation;
      let reason = "";

      if (
        company.name === undefined ||
        (_.isString(company.name) && company.name.length === 0)
      ) {
        op = "skip";
        reason = "No company name present.";
      }

      if (
        company.owner !== undefined &&
        // eslint-disable-next-line no-underscore-dangle
        !this.planhatUsers.map(u => u._id).includes(company.owner)
      ) {
        op = "skip";
        reason = "Invalid Owner ID.";
      }

      if (
        company.coOwner !== undefined &&
        // eslint-disable-next-line no-underscore-dangle
        !this.planhatUsers.map(u => u._id).includes(company.coOwner)
      ) {
        op = "skip";
        reason = "Invalid Co-Owner ID.";
      }

      reason = _.trim(reason);
      // eslint-disable-next-line no-param-reassign
      envelope.operation = op;
      if (op === "skip" && reason.length > 0) {
        // eslint-disable-next-line no-param-reassign
        envelope.reason = reason;
      }
    });

    return envelopes;
  }

  public setPlanhatUsers(users: PlanhatUser[]): void {
    while (this.planhatUsers.length !== 0) {
      this.planhatUsers.pop();
    }
    this.planhatUsers.push(...users);
  }

  public static filterIncomingContactsUpdated(
    contacts: Array<IPlanhatContact>,
    since: DateTime,
  ): Array<IPlanhatContact> {
    return _.filter(contacts, c => {
      return DateTime.fromISO(c.updatedAt) >= since;
    });
  }
}

// eslint-disable-next-line import/no-default-export
export default FilterUtil;
