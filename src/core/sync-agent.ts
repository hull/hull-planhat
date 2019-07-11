import IHullClient from "../types/hull-client";
import FilterUtil from "../utils/filter-util";
import MappingUtil from "../utils/mapping-util";
import IPrivateSettings from "../types/private-settings";
import _ from "lodash";
import IHullUserUpdateMessage from "../types/user-update-message";
import IHullAccountUpdateMessage from "../types/account-update-message";
import { IPlanhatContact, IOperationEnvelope } from "./planhat-objects";

class SyncAgent {
    private _hullClient: IHullClient;
    private _metricsClient: any;
    private _connector: any;
    private _filterUtil: FilterUtil;
    private _mappingUtil: MappingUtil;
    private _canCommunicateWithApi: boolean;

    /**
     * Initializes a new class of the SyncAgent.
     */
    constructor(client: IHullClient, connector: any, metricsClient: any) {
        this._hullClient = client;
        this._metricsClient = metricsClient;
        this._connector = connector;
        // Obtain the private settings from the connector and run some basic checks
        const privateSettings: IPrivateSettings = _.get(connector, "private_settings") as IPrivateSettings;
        this._canCommunicateWithApi = this.canCommunicateWithApi(privateSettings);
        // Initialize the utils
        this._filterUtil = new FilterUtil(privateSettings);
        this._mappingUtil = new MappingUtil(privateSettings);
    }

    /**
     * Synchronizes user update notification from the Hull platform to Planhat.
     *
     * @param {IHullUserUpdateMessage[]} messages The user update notification messages from the platform.
     * @param {boolean} [isBatch=false] True if batch processing; otherwise false.
     * @returns {Promise<any>} A promise which can be awaited.
     * @memberof SyncAgent
     */
    public async sendUserMessages(messages: IHullUserUpdateMessage[], isBatch: boolean = false): Promise<any> {
        if (this._canCommunicateWithApi === false) {
            return Promise.resolve(true);
        }

        // Filter messages based on connector configuration
        const filteredEnvelopes = this._filterUtil.filterUserMessages(messages, isBatch);
        const envelopesToProcess = _.filter(filteredEnvelopes, (envelope: IOperationEnvelope<IPlanhatContact>) => {
            return envelope.operation !== "skip";
        });

        if (envelopesToProcess.length === 0) {
            // TODO: Determine whether we want to log skip because it will
            //       be filtered anyways by Kraken going forward.
            return Promise.resolve(true);
        }

        // Map and validate envelopes
        _.forEach(envelopesToProcess, (envelope: IOperationEnvelope<IPlanhatContact>) => {
            envelope.serviceObject = this._mappingUtil.mapHullUserToPlanhatContact(envelope.msg as IHullUserUpdateMessage);
        });

        const envelopesFilteredForService = this._filterUtil.filterContactEnvelopes(envelopesToProcess);
        const envelopesValidated = _.filter(envelopesFilteredForService, (envelope: IOperationEnvelope<IPlanhatContact>) => {
            return envelope.operation !== "skip";
        });
        const envelopesInvalidated = _.filter(envelopesFilteredForService, (envelope: IOperationEnvelope<IPlanhatContact>) => {
            return envelope.operation === "skip";
        }); 

        // Log invalidated envelopes with skip reason
        _.forEach(envelopesInvalidated, (envelope: IOperationEnvelope<IPlanhatContact>) => {
            this._hullClient.asUser((envelope.msg as IHullUserUpdateMessage).user)
                .logger.info("outgoing.user.skip", { reason: envelope.reason });
        });
        
        // TODO: Process all valid users and send them to Planhat
        
        return Promise.resolve(true);
    }

    /**
     * Synchronizes account update notifications from the Hull platform to Planhat.
     *
     * @param {IHullAccountUpdateMessage[]} messages The account update notification messages from the platform.
     * @param {boolean} [isBatch=false] True if batch processing; otherwise false.
     * @returns {Promise<any>} A promise which can be awaited.
     * @memberof SyncAgent
     */
    public async sendAccountMessages(messages: IHullAccountUpdateMessage[], isBatch: boolean = false): Promise<any> {
        if (this._canCommunicateWithApi === false) {
            return Promise.resolve(true);
        }

        // Filter messages based on connector configuration
        const filteredMessages = isBatch === true ? messages: this._filterUtil.filterAccountMessages(messages);

        if (filteredMessages.length === 0) {
            return Promise.resolve(true);
        }

        // TODO: Replace with actual implementation
        return Promise.resolve(true);
    }

    /**
     * Checks whether the connector can communicate with the API or not
     *
     * @private
     * @param {IPrivateSettings} privateSettings The private settings of the connector.
     * @returns {boolean} True if the personal_access_token is specified; otherwise false.
     * @memberof SyncAgent
     */
    private canCommunicateWithApi(privateSettings: IPrivateSettings): boolean {
        if (privateSettings.personal_acccess_token === undefined ||
            privateSettings.personal_acccess_token === null) {
                return false;
        }

        return true;
    }
}

export default SyncAgent;