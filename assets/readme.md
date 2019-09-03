# Hull - Planhat Connector

> This connector is currently in Beta. While we always strive for high quality releases, we cannot guarantee that beta connectors are free of bugs.

This connector enables you to send Hull user and accounts to Planhat contacts and companies and also allows you to track events in Planhat.

This document was last updated on August 29, 2019. If you want to help us improve this documentation or have some feedback, please [contact us](https://help.hull.io/hc/en-us/requests/new)!

## Getting Started

1. From your Hull Connectors page click on 'Add a connector'
2. Search for 'Facebook Offline Conversions' and click on 'Install'
3. Authorize Hull to send data on your behalf by configuring the Planhat Connectivity section:
![Authorize Hull](./docs/getting_started_01.png)
Please obtain the `Personal Access Token` and `Tenant ID` from Planhat as well as the `API Prefix`. If you need help in obtaining any of this information, please refer to the [Planhat documentation](https://docs.planhat.com).

## Control outgoing data flow

### User data from Hull to Contacts in Planhat

You can synchronize user attributes from Hull with Planhat contacts by specifying one or more user segments in the `Contact Filter` and making the required mappings under `User attributes mapping`:
![Configure outgoing user data](./docs/outgoing_data_01.png)

*Note*: The segments cannot have the event as a condition, because evaluation takes place after the event occured. So the connector won't recognize that the user is in the segment. We recommend to use a generic segment, e.g. users with external_ids which ensures that users will be in the segment before the event is registered.

The connector will check the conditions in the following order:

1. Check if the user is in one of the segments listed under `Contact Filter`
2. Check if a new event occured which is in the `Tracking Filter`

The connector will send events with the `action` set to name of the event in Hull and all properties passed as `info` parameter to the Planhat API. If present, the name, email and external_id of the Hull user will be send along to attribute the event to the appropriate contact in Planhat.

### Account data from Hull to Companies in Planhat

You can synchronize account attributes from Hull with Planhat companies by specifying one or more account segments in the `Company Filter` and making the required mappings under `Account attributes mapping`:
![Configure outgoing account data](./docs/outgoing_data_02.png)

*Note*: The account must be in one of the whitelisted segments. The connector won't synchronize a linked account based on the fact that the user matches a whitlisted segment in the `Contact Filter`.

If you want to ensure that accounts are uniquely identified between all systems, you should enable the setting "Require `external_id` to synchronize?". This will prevent the connector from sending data to Planhat that doesn't have the most unique identifier.
