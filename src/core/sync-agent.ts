import _ from "lodash";
import IHullClient from "../types/hull-client";
import FilterUtil from "../utils/filter-util";
import MappingUtil from "../utils/mapping-util";
import PrivateSettings from "../types/private-settings";
import IHullUserUpdateMessage from "../types/user-update-message";
import IHullAccountUpdateMessage from "../types/account-update-message";
import {
  IPlanhatContact,
  IOperationEnvelope,
  IPlanhatEvent,
  IPlanhatCompany,
  PlanhatLicense,
  BulkUpsertResponse,
} from "./planhat-objects";
import PlanhatClient from "./planhat-client";
import IPlanhatClientConfig from "../types/planhat-client-config";
import asyncForEach from "../utils/async-foreach";
import IHullUserEvent from "../types/user-event";
import IHullAccount, { IHullAccountClaims } from "../types/account";
import ApiResultObject from "../types/api-result";
import { HullObjectType } from "../types/common-types";
import { IHullUserClaims } from "../types/user";
import { IPlanhatAccountDictionaryItem } from "../types/planhat-account-dict";
import PatchUtil from "../utils/patch-util";

/* eslint-disable no-underscore-dangle */

class SyncAgent {
  private _hullClient: IHullClient;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _metricsClient: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _connector: any;

  private _privateSettings: PrivateSettings;

  private _filterUtil: FilterUtil;

  private _mappingUtil: MappingUtil;

  private _canCommunicateWithApi: boolean;

  private _serviceClient: PlanhatClient;

  private _patchUtil: PatchUtil;

  /**
   * Initializes a new class of the SyncAgent.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(client: IHullClient, connector: any, metricsClient: any) {
    this._hullClient = client;
    this._metricsClient = metricsClient;
    this._connector = connector;
    // Obtain the private settings from the connector and run some basic checks
    this._privateSettings = _.get(
      connector,
      "private_settings",
    ) as PrivateSettings;
    this._privateSettings.account_require_externalid = true; // NOTE: Hardcoded for now to prevent shortcomings in PH API
    this._canCommunicateWithApi = this.canCommunicateWithApi();
    // Initialize the service client
    const svcClientConfig: IPlanhatClientConfig = {
      accessToken: this._privateSettings.personal_acccess_token || "",
      apiPrefix: this._privateSettings.api_prefix || "api",
      tenantId: this._privateSettings.tenant_id || "",
    };
    this._serviceClient = new PlanhatClient(svcClientConfig);
    // Initialize the utils
    this._filterUtil = new FilterUtil(this._privateSettings, []);
    this._mappingUtil = new MappingUtil(this._privateSettings);
    this._patchUtil = new PatchUtil(this._privateSettings);
  }

  /**
   * Synchronizes user update notification from the Hull platform to Planhat.
   *
   * @param {IHullUserUpdateMessage[]} messages The user update notification messages from the platform.
   * @param {boolean} [isBatch=false] True if batch processing; otherwise false.
   * @returns {Promise<unknown>} A promise which can be awaited.
   * @memberof SyncAgent
   */
  public async sendUserMessages(
    messages: IHullUserUpdateMessage[],
    isBatch = false,
  ): Promise<unknown> {
    if (this._canCommunicateWithApi === false) {
      return Promise.resolve(true);
    }

    // Note: We need to query the users once here and update the utils with the values
    const planhatUsersResult = await this._serviceClient.listUsers();
    this._filterUtil.setPlanhatUsers(planhatUsersResult.data);

    // Filter messages based on connector configuration
    const filteredEnvelopes = this._filterUtil.filterUserMessages(
      messages,
      isBatch,
    );
    const envelopesToProcess = _.filter(
      filteredEnvelopes,
      (envelope: IOperationEnvelope<IPlanhatContact>) => {
        return envelope.operation !== "skip";
      },
    );

    if (envelopesToProcess.length === 0) {
      return Promise.resolve(true);
    }

    // We need an efficient way to handle companies if they don't have a Planhat/ID:
    // - Create a dictionary with Hull account ids
    // - Create all accounts which don't have a Planhat/ID
    // - Do NOT update companies with Planhat/ID
    // - Update the dictionary to reflect the Planhat/ID
    const acctDict = this._mappingUtil.mapHullUserEnvelopesToPlanhatAccountDict(
      envelopesToProcess,
    );
    await asyncForEach(
      _.values(acctDict),
      async (acctInfo: IPlanhatAccountDictionaryItem) => {
        if (
          acctInfo.serviceId === undefined &&
          acctInfo.hullExternalId !== undefined
        ) {
          // Account is not in Planhat yet according to Hull, so we need to create it if it doesn't exist
          // given the fact that it has an `external_id`.
          const serviceObjectAcct = this._mappingUtil.mapHullAccountProfileToPlanhatCompany(
            acctInfo.hullProfile,
          );

          const findResult = await this._serviceClient.findCompanyByExternalId(
            serviceObjectAcct.externalId as string,
          );
          if (
            findResult.data !== null &&
            findResult.data !== undefined &&
            findResult.data.length !== 0 &&
            findResult.success
          ) {
            // Found a company, so add the planhat id
            const clonedInfo = _.cloneDeep(acctInfo);
            clonedInfo.serviceId = (_.first(
              findResult.data,
            ) as IPlanhatCompany)._id;
            acctDict[clonedInfo.hullId] = clonedInfo;
          } else if (findResult.success) {
            // No company with the given external_id is present, so create it
            const createResult = await this._serviceClient.createCompany(
              serviceObjectAcct,
            );
            const logClient = this._hullClient.asAccount({
              id: acctInfo.hullId,
              external_id: acctInfo.hullExternalId,
            });

            if (createResult.success) {
              const clonedInfo = _.cloneDeep(acctInfo);
              clonedInfo.serviceId = (createResult.data as IPlanhatCompany)._id;
              acctDict[clonedInfo.hullId] = clonedInfo;
              logClient.logger.info("outgoing.account.success", createResult);
            } else {
              // Log the error
              logClient.logger.error("outgoing.account.error", createResult);
            }
          }
        }
      },
    );
    // Map and validate envelopes
    _.forEach(
      envelopesToProcess,
      (envelope: IOperationEnvelope<IPlanhatContact>) => {
        // eslint-disable-next-line no-param-reassign
        envelope.serviceObject = this._mappingUtil.mapHullUserToPlanhatContact(
          envelope.msg as IHullUserUpdateMessage,
        );
        // Since we have the companies already been taken care of, let's add them directly here if it is undefined
        if (
          envelope.serviceObject.companyId === undefined &&
          envelope.msg.account !== undefined
        ) {
          const acctInfo = acctDict[envelope.msg.account.id];
          // eslint-disable-next-line no-param-reassign
          envelope.serviceObject.companyId = acctInfo.serviceId;
        }
      },
    );

    const envelopesFilteredForService = this._filterUtil.filterContactEnvelopes(
      envelopesToProcess,
    );
    const envelopesValidated = _.filter(
      envelopesFilteredForService,
      (envelope: IOperationEnvelope<IPlanhatContact>) => {
        return envelope.operation !== "skip";
      },
    );
    const envelopesInvalidated = _.filter(
      envelopesFilteredForService,
      (envelope: IOperationEnvelope<IPlanhatContact>) => {
        return envelope.operation === "skip";
      },
    );

    // Log invalidated envelopes with skip reason
    _.forEach(
      envelopesInvalidated,
      (envelope: IOperationEnvelope<IPlanhatContact>) => {
        this._hullClient
          .asUser((envelope.msg as IHullUserUpdateMessage).user)
          .logger.info("outgoing.user.skip", { reason: envelope.reason });
      },
    );

    // Process all valid users and send them to Planhat
    await asyncForEach(
      envelopesValidated,
      async (envelope: IOperationEnvelope<IPlanhatContact>) => {
        // NOTE: Lookup only works with email, so we cannot rely on external_id
        const lookupResult = await this._serviceClient.findContactByEmail(
          (envelope.serviceObject as IPlanhatContact).email as string,
        );

        if (
          lookupResult.success &&
          _.first(lookupResult.data) &&
          (_.first(lookupResult.data) as IPlanhatContact)._id !== undefined
        ) {
          // eslint-disable-next-line no-param-reassign
          (envelope.serviceObject as IPlanhatContact).id = (_.first(
            lookupResult.data,
          ) as IPlanhatContact)._id;

          const hasChanges = this._patchUtil.hasUserChangesToUpdate(
            envelope.serviceObject as IPlanhatContact,
            _.first(lookupResult.data) as IPlanhatContact,
          );
          if (hasChanges) {
            // Update the existing contact
            const updateResult = await this._serviceClient.updateContact(
              envelope.serviceObject as IPlanhatContact,
            );
            this.handleOutgoingResult(envelope, updateResult, "user");
          } else {
            this._hullClient
              .asUser((envelope.msg as IHullUserUpdateMessage).user)
              .logger.info("outgoing.user.skip", {
                reason:
                  "All mapped attributes are already in sync between Hull and Planhat.",
              });
          }
        } else {
          // Create a new contact
          const insertResult = await this._serviceClient.createContact(
            envelope.serviceObject as IPlanhatContact,
          );
          this.handleOutgoingResult(envelope, insertResult, "user");
        }
      },
    );

    // console.log(">>> ENVELOPES:", envelopesValidated, envelopesInvalidated);
    // Process all events and track them in Planhat
    let eventMessages: IHullUserUpdateMessage[] = _.map(
      envelopesValidated,
      (envelope: IOperationEnvelope<IPlanhatContact>) =>
        envelope.msg as IHullUserUpdateMessage,
    );
    eventMessages = this._filterUtil.filterMessagesWithEvent(eventMessages);

    const eventsToTrack: IPlanhatEvent[] = [];
    _.forEach(eventMessages, (msg: IHullUserUpdateMessage) => {
      const filteredEvents = this._filterUtil.filterEvents(msg.events);
      if (filteredEvents.length > 0) {
        _.forEach(filteredEvents, (hullEvent: IHullUserEvent) => {
          const phEvent = this._mappingUtil.mapHullUserEventToPlanhatEvent(
            msg,
            hullEvent,
          );
          eventsToTrack.push(phEvent);
        });
      }
    });

    if (eventsToTrack.length > 0) {
      await asyncForEach(eventsToTrack, async (evt: IPlanhatEvent) => {
        const trackResult = await this._serviceClient.trackEvent(evt);
        const scopedTrackClient = this._hullClient.asUser({
          email: evt.email,
          external_id: evt.externalId,
        });
        if (trackResult.success === true) {
          scopedTrackClient.logger.info(
            `outgoing.user_event.success`,
            trackResult,
          );
        } else {
          scopedTrackClient.logger.error(
            `outgoing.user_event.error`,
            trackResult,
          );
        }
      });
    }

    return Promise.resolve(true);
  }

  /**
   * Synchronizes account update notifications from the Hull platform to Planhat.
   *
   * @param {IHullAccountUpdateMessage[]} messages The account update notification messages from the platform.
   * @param {boolean} [isBatch=false] True if batch processing; otherwise false.
   * @returns {Promise<unknown>} A promise which can be awaited.
   * @memberof SyncAgent
   */
  public async sendAccountMessages(
    messages: IHullAccountUpdateMessage[],
    isBatch = false,
  ): Promise<unknown> {
    if (this._canCommunicateWithApi === false) {
      return Promise.resolve(true);
    }

    // Note: We need to query the users once here and update the utils with the values
    const planhatUsersResult = await this._serviceClient.listUsers();
    this._filterUtil.setPlanhatUsers(planhatUsersResult.data);

    try {
      // Filter messages based on connector configuration
      const filteredEnvelopes = this._filterUtil.filterAccountMessages(
        messages,
        isBatch,
      );
      const envelopesToProcess = _.filter(
        filteredEnvelopes,
        (envelope: IOperationEnvelope<IPlanhatCompany>) => {
          return envelope.operation !== "skip";
        },
      );

      if (envelopesToProcess.length === 0) {
        // TODO: Determine whether we want to log skip because it will
        //       be filtered anyways by Kraken going forward.
        return Promise.resolve(true);
      }

      // Map and validate envelopes
      _.forEach(
        envelopesToProcess,
        (envelope: IOperationEnvelope<IPlanhatCompany>) => {
          // eslint-disable-next-line no-param-reassign
          envelope.serviceObject = this._mappingUtil.mapHullAccountToPlanhatCompany(
            envelope.msg as IHullAccountUpdateMessage,
          );
        },
      );

      const envelopesFilteredForService = this._filterUtil.filterCompanyEnvelopes(
        envelopesToProcess,
      );
      const envelopesValidated = _.filter(
        envelopesFilteredForService,
        (envelope: IOperationEnvelope<IPlanhatCompany>) => {
          return envelope.operation !== "skip";
        },
      );
      const envelopesInvalidated = _.filter(
        envelopesFilteredForService,
        (envelope: IOperationEnvelope<IPlanhatCompany>) => {
          return envelope.operation === "skip";
        },
      );

      // Log invalidated envelopes with skip reason
      _.forEach(
        envelopesInvalidated,
        (envelope: IOperationEnvelope<IPlanhatCompany>) => {
          this._hullClient
            .asAccount(
              (envelope.msg as IHullAccountUpdateMessage)
                .account as IHullAccount,
            )
            .logger.info("outgoing.account.skip", { reason: envelope.reason });
        },
      );

      // Process all valid companies and send them to Planhat
      await asyncForEach(
        envelopesValidated,
        async (envelope: IOperationEnvelope<IPlanhatCompany>) => {
          let lookupResult: ApiResultObject<IPlanhatCompany> = {
            success: false,
            data: null,
            endpoint: "none",
            method: "query",
            record: undefined,
          };

          if ((envelope.serviceObject as IPlanhatCompany).externalId) {
            lookupResult = await this._serviceClient.findCompanyByExternalId(
              (envelope.serviceObject as IPlanhatCompany).externalId as string,
            );
          }

          if (
            lookupResult.success === false &&
            (envelope.serviceObject as IPlanhatCompany).id
          ) {
            lookupResult = await this._serviceClient.getCompanyById(
              (envelope.serviceObject as IPlanhatCompany).id as string,
            );
          }

          if (
            lookupResult.success &&
            (lookupResult.data as IPlanhatCompany)._id !== undefined
          ) {
            // eslint-disable-next-line no-param-reassign
            (envelope.serviceObject as IPlanhatCompany).id = (lookupResult.data as IPlanhatCompany)._id;
            // Update the existing company
            const hasChanges = this._patchUtil.hasCompanyChangesToUpdate(
              envelope.serviceObject as IPlanhatCompany,
              lookupResult.data as IPlanhatCompany,
            );
            if (hasChanges) {
              const updateResult = await this._serviceClient.updateCompany(
                envelope.serviceObject as IPlanhatCompany,
              );
              const outgoingRes = await this.handleOutgoingResult(
                envelope,
                updateResult,
                "account",
              );
              // eslint-disable-next-line no-console
              console.log(outgoingRes);
            } else {
              this._hullClient
                .asAccount(envelope.msg.account as IHullAccountClaims)
                .logger.log("outgoing.account.skip", {
                  reason:
                    "All mapped attributes are already in sync between Hull and Planhat.",
                });
            }
            // Process licenses
            const phLicenses = this._mappingUtil.mapHullAccountToLicenses(
              (lookupResult.data as IPlanhatCompany)._id as string,
              envelope.msg.account as IHullAccount,
            );
            if (phLicenses.length > 0) {
              const licensesBulkResult = await this._serviceClient.bulkUpsertLicenses(
                phLicenses,
              );

              this.handleOutgoingBulkResultLicenses(
                envelope.msg.account as IHullAccount,
                licensesBulkResult,
              );
            }
          } else {
            // Create a new company
            const insertResult = await this._serviceClient.createCompany(
              envelope.serviceObject as IPlanhatCompany,
            );
            await this.handleOutgoingResult(envelope, insertResult, "account");

            // Process licenses
            if (insertResult.success === true) {
              const companyId = insertResult.data._id;
              const phLicenses = this._mappingUtil.mapHullAccountToLicenses(
                companyId,
                envelope.msg.account as IHullAccount,
              );
              if (phLicenses.length > 0) {
                const licensesBulkResult = await this._serviceClient.bulkUpsertLicenses(
                  phLicenses,
                );

                this.handleOutgoingBulkResultLicenses(
                  envelope.msg.account as IHullAccount,
                  licensesBulkResult,
                );
              }
            }
          }
        },
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(">>> ERROR", error);
    }

    return Promise.resolve(true);
  }

  /**
   * Checks whether the connector can communicate with the API or not
   *
   * @private
   * @returns {boolean} True if the personal_access_token is specified; otherwise false.
   * @memberof SyncAgent
   */
  private canCommunicateWithApi(): boolean {
    if (this._privateSettings.personal_acccess_token === undefined) {
      return false;
    }

    return true;
  }

  private handleOutgoingResult<T>(
    envelope: IOperationEnvelope<T>,
    operationResult: ApiResultObject<T>,
    hullType: HullObjectType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const hullIdentity =
      hullType === "account"
        ? ((envelope.msg as IHullAccountUpdateMessage).account as IHullAccount)
        : (envelope.msg as IHullUserUpdateMessage).user;

    let scopedClient =
      hullType === "account"
        ? this._hullClient.asAccount(hullIdentity as IHullAccountClaims)
        : this._hullClient.asUser(hullIdentity as IHullUserClaims);

    if (operationResult.success === true) {
      _.set(
        hullIdentity,
        "anonymous_id",
        `planhat:${_.get(operationResult, "data._id", null)}`,
      );
      scopedClient =
        hullType === "account"
          ? this._hullClient.asAccount(hullIdentity as IHullAccountClaims)
          : this._hullClient.asUser(hullIdentity as IHullUserClaims);

      scopedClient.logger.info(`outgoing.${hullType}.success`, operationResult);

      if (hullType === "account") {
        const accountAttributes = this._mappingUtil.mapPlanhatCompanyToAccountAttributes(
          operationResult.data,
        );
        return scopedClient.traits(accountAttributes);
      }

      if (hullType === "user") {
        return scopedClient.traits(
          this._mappingUtil.mapPlanhatContactToUserAttributes(
            operationResult.data,
          ),
        );
      }
    } else {
      scopedClient.logger.error(`outgoing.${hullType}.error`, operationResult);
      return Promise.resolve(false);
    }

    return Promise.resolve(false);
  }

  private handleOutgoingBulkResultLicenses(
    account: IHullAccount,
    result: ApiResultObject<PlanhatLicense[]>,
  ): Promise<unknown> {
    const scopedClient = this._hullClient.asAccount(account);

    if (result.success) {
      if (
        (result.data as BulkUpsertResponse).createdErrors.length > 0 ||
        (result.data as BulkUpsertResponse).updatedErrors.length > 0
      ) {
        scopedClient.logger.error(`outgoing.account.error`, result);
      } else {
        scopedClient.logger.info(`outgoing.account.success`, result);
      }
    } else {
      scopedClient.logger.error(`outgoing.account.error`, result);
    }

    return Promise.resolve(false);
  }
}

/* eslint-enable no-underscore-dangle */

// eslint-disable-next-line import/no-default-export
export default SyncAgent;
