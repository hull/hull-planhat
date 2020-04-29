import _ from "lodash";
import { AwilixContainer } from "awilix";
import { DateTime, Duration } from "luxon";
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
  PlanhatUser,
  IncomingFetchJob,
  PlanhatObjectTypeIncoming,
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
import { ConnectorRedisClient } from "../utils/redis-client";
import { ConnectorStatusResponse } from "../types/connector-status";
import {
  STATUS_PAT_MISSING,
  STATUS_TENANTID_MISSING,
  STATUS_INVALID_MAPPING_PLANHAT,
  STATUS_INCOMPLETE_LICENSEMAP_ITEMMAPPINGS,
  STATUS_INCOMPLETE_LICENSEMAP_ACCOUNTATTRIBUTE,
} from "./common-constants";
import PLANHAT_PROPERTIES from "./planhat-properties";

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

  private diContainer: AwilixContainer;

  /**
   * Initializes a new class of the SyncAgent.
   */
  constructor(
    client: IHullClient,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connector: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metricsClient: any,
    container: AwilixContainer,
  ) {
    this.diContainer = container;
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
    const planhatUsersResult = await this.getPlanhatUsers();
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
    const planhatUsersResult = await this.getPlanhatUsers();
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

  // eslint-disable-next-line class-methods-use-this
  public async determineConnectorStatus(): Promise<ConnectorStatusResponse> {
    const status: ConnectorStatusResponse = {
      status: "ok",
      messages: [],
    };

    // Check setup
    if (
      this._privateSettings.personal_acccess_token === undefined ||
      this._privateSettings.personal_acccess_token === "" ||
      _.trim(this._privateSettings.personal_acccess_token).length === 0
    ) {
      status.status = "setupRequired";
      status.messages.push(STATUS_PAT_MISSING);
    }

    if (
      this._privateSettings.tenant_id === undefined ||
      this._privateSettings.tenant_id === "" ||
      _.trim(this._privateSettings.tenant_id).length === 0
    ) {
      status.status = "setupRequired";
      status.messages.push(STATUS_TENANTID_MISSING);
    }

    // Only check warning and error if setup check is green
    if (status.status === "ok") {
      // Check license configuration (out)
      if (
        !_.isNil(this._privateSettings.account_licenses_attribute) &&
        (_.isNil(this._privateSettings.account_licenses_attributes_outbound) ||
          this._privateSettings.account_licenses_attributes_outbound.length ===
            0)
      ) {
        status.status = "warning";
        status.messages.push(STATUS_INCOMPLETE_LICENSEMAP_ITEMMAPPINGS);
      }
      if (
        _.isNil(this._privateSettings.account_licenses_attribute) &&
        !_.isNil(this._privateSettings.account_licenses_attributes_outbound) &&
        this._privateSettings.account_licenses_attributes_outbound.length !== 0
      ) {
        status.status = "warning";
        status.messages.push(STATUS_INCOMPLETE_LICENSEMAP_ACCOUNTATTRIBUTE);
      }
      // Check restricted mappings for users (out)
      const allowedPlanhatContactOut = _.keys(PLANHAT_PROPERTIES.CONTACTS);
      _.forEach(this._privateSettings.contact_attributes_outbound, map => {
        if (
          map.hull_field_name !== undefined &&
          map.service_field_name !== undefined &&
          !allowedPlanhatContactOut.includes(map.service_field_name)
        ) {
          status.status = "error";
          status.messages.push(
            STATUS_INVALID_MAPPING_PLANHAT(
              map.hull_field_name,
              map.service_field_name,
              "User attributes mapping",
            ),
          );
        }
      });
      // Check restricted mappings for accounts (out)
      const allowedPlanhatCompaniesOut = _.keys(PLANHAT_PROPERTIES.COMPANIES);
      _.forEach(this._privateSettings.account_attributes_outbound, map => {
        if (
          map.hull_field_name !== undefined &&
          map.service_field_name !== undefined &&
          !allowedPlanhatCompaniesOut.includes(map.service_field_name)
        ) {
          status.status = "error";
          status.messages.push(
            STATUS_INVALID_MAPPING_PLANHAT(
              map.hull_field_name,
              map.service_field_name,
              "Account attributes mapping",
            ),
          );
        }
      });
    }

    if (!_.isNil(this._hullClient)) {
      await this._hullClient.put(`${this._connector.id}/status`, status);
    }

    return Promise.resolve(status);
  }

  public async fetchIncoming(
    objectType: PlanhatObjectTypeIncoming,
  ): Promise<boolean> {
    if (!this.canCommunicateWithApi()) {
      return Promise.resolve(false);
    }

    const pageCount = 100;
    let currentJob = await this.getCurrentJob(objectType);
    const lastJob = await this.getLastJob(objectType);

    let intervalStr = "180";
    switch (objectType) {
      case "companies":
        if (this._privateSettings.fetch_interval_accounts) {
          intervalStr = this._privateSettings.fetch_interval_accounts;
        }
        break;
      default:
        if (this._privateSettings.fetch_interval_users) {
          intervalStr = this._privateSettings.fetch_interval_users;
        }
        break;
    }

    if (
      lastJob &&
      DateTime.fromISO(lastJob.startDate).plus(
        Duration.fromObject({ minutes: parseInt(intervalStr, 10) }),
      ) > DateTime.utc()
    ) {
      this._hullClient.logger.debug("incoming.job.skip", {
        reason:
          "Interval between last job and now is less than configured threshold",
        lastJob,
        intervalStr,
        objectType,
      });
      return Promise.resolve(false);
    }

    const nowInitial = DateTime.utc();

    if (currentJob === undefined) {
      // new job to be spun up
      const iniTimestamp = DateTime.utc().toISO();
      currentJob = {
        objectType,
        endDate: undefined,
        lastActivity: iniTimestamp,
        startDate: iniTimestamp,
        offset: 0,
        limit: pageCount,
        filterStart: lastJob
          ? lastJob.startDate
          : DateTime.fromISO("1970-01-01T00:00:00.000Z").toISO(),
        totalRecords: 0,
        importedRecords: 0,
      };
    } else if (
      nowInitial.diff(DateTime.fromISO(currentJob.lastActivity), "minutes")
        .minutes < 5
    ) {
      // active job, so leave the function
      return Promise.resolve(false);
    } else {
      // resume the job, but log new activity
      currentJob.lastActivity = DateTime.utc().toISO();
    }

    // Update the current job, to lock out all other parallel processing
    await this.upsertCurrentJob(objectType, _.cloneDeep(currentJob));

    if (currentJob.offset === 0) {
      // Log out the start of a job
      this._hullClient.logger.info(
        "incoming.job.start",
        _.cloneDeep(currentJob),
      );
    } else {
      // TODO: Check if we want to log it out to the user or not
      this._hullClient.logger.debug(
        "incoming.job.resume",
        _.cloneDeep(currentJob),
      );
    }

    if (objectType === "companies") {
      let fetchedCompanies = [];
      while (fetchedCompanies.length === pageCount || currentJob.offset === 0) {
        this._hullClient.logger.info(
          "incoming.job.progress",
          _.cloneDeep(currentJob),
        );
        // eslint-disable-next-line no-await-in-loop
        const apiResult: ApiResultObject<IPlanhatCompany> = await this._serviceClient.listCompanies(
          currentJob.offset,
          pageCount,
        );
        fetchedCompanies = apiResult.data;

        // Note: We cannot filter companies which have been changed since filterStart,
        // because the Planhat API doesn't have an updatedAt for companies

        // Import companies to Hull
        // eslint-disable-next-line no-await-in-loop
        await this.handleIncomingAccounts(fetchedCompanies);

        currentJob.offset += pageCount;
        currentJob.totalRecords += fetchedCompanies.length;
        currentJob.importedRecords += fetchedCompanies.length;

        // Update the current job
        // eslint-disable-next-line no-await-in-loop
        await this.upsertCurrentJob(objectType, _.cloneDeep(currentJob));
      }
    } else if (objectType === "endusers") {
      let fetchedUsers: IPlanhatContact[] = [];
      while (fetchedUsers.length === pageCount || currentJob.offset === 0) {
        this._hullClient.logger.info(
          "incoming.job.progress",
          _.cloneDeep(currentJob),
        );

        // eslint-disable-next-line no-await-in-loop
        const apiResult: ApiResultObject<IPlanhatContact> = await this._serviceClient.listEndusers(
          currentJob.offset,
          pageCount,
        );
        fetchedUsers = apiResult.data;

        const filteredUsers = FilterUtil.filterIncomingContactsUpdated(
          fetchedUsers,
          DateTime.fromISO(currentJob.filterStart),
        );

        // Import Endusers as Users into Hull
        // eslint-disable-next-line no-await-in-loop
        await this.handleIncomingUsers(filteredUsers);

        currentJob.offset += pageCount;
        currentJob.totalRecords += fetchedUsers.length;
        currentJob.importedRecords += filteredUsers.length;

        // Update the current job
        // eslint-disable-next-line no-await-in-loop
        await this.upsertCurrentJob(objectType, _.cloneDeep(currentJob));
      }
    }

    // Upsert the last job and delete the current one
    currentJob.endDate = DateTime.utc().toISO();
    await this.upsertLastJob(objectType, _.cloneDeep(currentJob));
    await this.deleteCurrentJob(objectType);
    // Log out job completion
    this._hullClient.logger.info("incoming.job.success", currentJob);

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

  private async getPlanhatUsers(): Promise<ApiResultObject<PlanhatUser>> {
    let redisClient: ConnectorRedisClient | undefined;
    try {
      redisClient = this.diContainer.resolve("redisClient");
    } catch (error) {
      this._hullClient.logger.debug("connector.di.failed", error);
    }

    let result: ApiResultObject<PlanhatUser> = {
      data: undefined,
      endpoint: `redis/users_${this._connector.id}`,
      method: "query",
      record: undefined,
      success: true,
    };

    if (redisClient !== undefined) {
      const cachedData = await redisClient.get<Array<PlanhatUser>>(
        `users_${this._connector.id}`,
      );
      result.data = cachedData;
    }

    if (result.data === undefined) {
      // We either missed the cache or nothing is cached.
      result = await this._serviceClient.listUsers();
    }

    return result;
  }

  private async getLastJob(
    objectType: PlanhatObjectTypeIncoming,
  ): Promise<IncomingFetchJob | undefined> {
    const redisClnt = this.diContainer.resolve(
      "redisClient",
    ) as ConnectorRedisClient;
    const connectorId = this._connector.id;
    const cacheKey = `${objectType}_${connectorId}_lastjob`;

    const jobInfo = await redisClnt.get<string>(cacheKey);

    // eslint-disable-next-line no-console
    console.log(">>> Last Job Info", jobInfo, typeof jobInfo);

    if (_.isNil(jobInfo) || jobInfo === undefined) {
      return undefined;
    }

    if (_.isString(jobInfo)) {
      return JSON.parse(jobInfo) as IncomingFetchJob;
    }

    return jobInfo as IncomingFetchJob;
  }

  private async getCurrentJob(
    objectType: PlanhatObjectTypeIncoming,
  ): Promise<IncomingFetchJob | undefined> {
    const redisClnt = this.diContainer.resolve(
      "redisClient",
    ) as ConnectorRedisClient;
    const connectorId = this._connector.id;
    const cacheKey = `${objectType}_${connectorId}_currentjob`;

    const jobInfo = await redisClnt.get<string>(cacheKey);

    if (_.isNil(jobInfo)) {
      return undefined;
    }

    return JSON.parse(jobInfo) as IncomingFetchJob;
  }

  private async upsertLastJob(
    objectType: PlanhatObjectTypeIncoming,
    jobInfo: IncomingFetchJob,
  ): Promise<string> {
    const redisClnt = this.diContainer.resolve(
      "redisClient",
    ) as ConnectorRedisClient;
    const connectorId = this._connector.id;
    const cacheKey = `${objectType}_${connectorId}_lastjob`;

    const redisResult = await redisClnt.set(cacheKey, JSON.stringify(jobInfo));

    // eslint-disable-next-line no-console
    console.log(redisResult);

    return redisResult;
  }

  private async upsertCurrentJob(
    objectType: PlanhatObjectTypeIncoming,
    jobInfo: IncomingFetchJob,
  ): Promise<string> {
    const redisClnt = this.diContainer.resolve(
      "redisClient",
    ) as ConnectorRedisClient;
    const connectorId = this._connector.id;
    const cacheKey = `${objectType}_${connectorId}_currentjob`;

    const redisResult = await redisClnt.set(cacheKey, JSON.stringify(jobInfo));

    // eslint-disable-next-line no-console
    console.log(redisResult);

    return redisResult;
  }

  private async deleteCurrentJob(
    objectType: PlanhatObjectTypeIncoming,
  ): Promise<number> {
    const redisClnt = this.diContainer.resolve(
      "redisClient",
    ) as ConnectorRedisClient;
    const connectorId = this._connector.id;
    const cacheKey = `${objectType}_${connectorId}_currentjob`;

    const redisResult = await redisClnt.delete(cacheKey);

    // eslint-disable-next-line no-console
    console.log(redisResult);

    return redisResult;
  }

  private async handleIncomingAccounts(
    data: IPlanhatCompany[],
  ): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const promises: Promise<any>[] = [];

    _.forEach(data, d => {
      const accountIdent = {
        anonymous_id: `planhat:${d._id}`,
      };
      if (d.externalId) {
        _.set(accountIdent, "external_id", d.externalId);
      }

      if (d.domains && d.domains.length === 1) {
        _.set(accountIdent, "domain", _.first(d.domains));
      }
      const accountAttributes = this._mappingUtil.mapPlanhatCompanyToAccountAttributes(
        d,
      );

      promises.push(
        this._hullClient
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .asAccount(accountIdent as any)
          .traits(accountAttributes),
      );

      this._hullClient
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .asAccount(accountIdent as any)
        .logger.info("incoming.account.success", { data: d });
    });

    return Promise.all(promises);
  }

  private async handleIncomingUsers(data: IPlanhatContact[]): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const promises: Promise<any>[] = [];

    _.forEach(data, d => {
      const userIdent = {
        anonymous_id: `planhat:${d._id}`,
      };
      if (d.externalId) {
        _.set(userIdent, "external_id", d.externalId);
      }

      if (d.email) {
        _.set(userIdent, "email", d.email);
      }
      const userAttributes = this._mappingUtil.mapPlanhatContactToUserAttributes(
        d,
      );

      promises.push(
        this._hullClient
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .asUser(userIdent as any)
          .traits(userAttributes),
      );

      this._hullClient
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .asAccount(userIdent as any)
        .logger.info("incoming.user.success", { data: d });
    });

    return Promise.all(promises);
  }
}

/* eslint-enable no-underscore-dangle */

// eslint-disable-next-line import/no-default-export
export default SyncAgent;
