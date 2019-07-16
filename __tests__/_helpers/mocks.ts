import IHullClient from "../../src/types/hull-client";
import IPrivateSettings from "../../src/types/private-settings";

const ClientMock: any = jest.fn<IHullClient, []>(() => ({
    configuration: {},
    api: jest.fn(() => Promise.resolve()),
    asAccount: jest.fn(() => new ClientMock()),
    asUser: jest.fn(() => new ClientMock()),
    del: jest.fn(() => Promise.resolve()),
    get: jest.fn(() => Promise.resolve()),
    logger: {
        // tslint:disable-next-line:no-console
        info: jest.fn((msg, data) => console.log(msg, data)),
        // tslint:disable-next-line:no-console
        debug: jest.fn((msg, data) => console.log(msg, data)),
        // tslint:disable-next-line:no-console
        error: jest.fn((msg, data) => console.log(msg, data)),
        // tslint:disable-next-line:no-console
        warn: jest.fn((msg, data) => console.log(msg, data)),
        // tslint:disable-next-line:no-console
        log: jest.fn((msg, data) => console.log(msg, data)),
        // tslint:disable-next-line:no-console
        silly: jest.fn((msg, data) => console.log(msg, data)),
        // tslint:disable-next-line:no-console
        verbose: jest.fn((msg, data) => console.log(msg, data))
    },
    post: jest.fn(() => Promise.resolve()),
    put: jest.fn(() => Promise.resolve()),
    utils: {}
}));

class ConnectorMock {
    constructor(id: string, settings: any, privateSettings: IPrivateSettings) {
        this.id = id;
        this.settings = settings;
        this.private_settings = privateSettings;
    }
    public id: string;
    public settings: any;
    // tslint:disable-next-line:variable-name
    public private_settings: IPrivateSettings;
}

// tslint:disable-next-line: max-classes-per-file
class ContextMock {

    constructor(id: string, settings: any, privateSettings: IPrivateSettings) {
        this.ship = new ConnectorMock(id, settings, privateSettings);
        this.connector = new ConnectorMock(id, settings, privateSettings);
        this.client = new ClientMock();
        this.metric = {
            // tslint:disable-next-line:no-console
            increment: jest.fn((name, value) => console.log(name, value)),
            // tslint:disable-next-line:no-console
            value: jest.fn((name, value) => console.log(name, value))
        }
    }
    // Public properties
    public ship: any;
    public connector: any;
    public client: IHullClient;
    public metric: any;
}

export default { ClientMock, ConnectorMock, ContextMock };
