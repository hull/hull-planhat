# hull-planhat

![Node.js CI](https://github.com/hull/hull-planhat/workflows/Node.js%20CI/badge.svg)

Hull connector for planhat.com

## Features

The Planhat Connector allows you to synchronize Hull User Profiles to Planhat EndUser objects and Hull Account Profiles to Planhat Company objects. The synchronization is bi-directional, however certain limitations apply for fetching data from Planhat due to technical limitations.

### User Synchronization

To establish a reliable synchronization, the following restrictions had to be put in place:

- Hull Users need to be linked to Accounts with `external_id`
- Hull Users need to have an email address which is unique

The synchronization logic is implemented as described below:

#### Matching Logic for Users

Hull Users are matched to Planhat EndUsers with the email address or external id. If an EndUsers with a matching email or external id is found in Planhat, the Connector will perform an update, if no matching EndUser is found, the Connector will perform an insert. There is no normalization or any other manipulation of the email address implemented, the string is taken as-is.

#### Update Logic for Users

The Connector will only perform an update operation against the Planhat API if any of the synchronized attributes has changed. This is to prevent circular infinite data flows, because Planhat will modify the timestamp `updatedAt` regardless whether there has been a change or not.

Performing a batch send operation for users will bypass the change detection and send all users in said batch to the API.

#### Fetching Logic for Users

The Connector fetches Planhat Enduser data on a scheduled interval which can be configured in the Settings. Since there is no change detection on the Planhat API, the Connector performs a full fetch, iterating over the entire portfolio in Planhat. The Connector has an internal mechanism to filter only updated Endusers since the last fetch to reduce the number of incoming requests in Hull which is a billable metric.

### Account Synchronization

To establish a reliable synchronization, the following restrictions apply:

- Hull Accounts need to have an `external_id`

The synchronization logic is implemented as described below:

#### Matching Logic for Accounts

Hull Users are matched to Planhat Companies by the external id. If a Company with a matching external id is found in Planhat, the Connector will perform an update, if no matching Company is found, the Connector will perform an insert.

#### Update Logic for Accounts

The Connector will only perform an update operation against the Planhat API if any of the synchronized attributes has changed. This is to prevent circular infinite data flows, because Planhat will modify the timestamp `updatedAt` regardless whether there has been a change or not.

Performing a batch send operation for users will bypass the change detection and send all users in said batch to the API.

#### Fetching Logic for Accounts

The Connector fetches Planhat Company data on a scheduled interval which can be configured in the Settings. Since there is no change detection on the Planhat API, the Connector performs a full fetch, iterating over the entire portfolio in Planhat. Keep in mind that every company in Planhat will result in one incoming request in Hull which is billable.

**Important**: The list endpoint of Planhat for companies does not provide all fields, please refer to the API docs for the available fields: [https://docs.planhat.com/?version=latest#d1025b71-e283-4fd4-a04d-ad87fdd0e46f](https://docs.planhat.com/?version=latest#d1025b71-e283-4fd4-a04d-ad87fdd0e46f)

### Internal API

#### Authentication

The internal API is secured with Basic Auth using the credentials of the connector:

| Basic Auth | Connector Credential |
| ---------- | -------------------- |
| Username   | Connector ID         |
| Password   | Connector Secret     |

The organization needs to be passed along as querystring parameter `org`. Request which are not properly authenticated will be rejected with error codes `400`, `401` or `403`.

#### Users

The connector exposes an internal API which allows the management of Users in Planhat to list, read, create or update users.

| ID           | Endpoint                    | Method | Description                   |
| ------------ | --------------------------- | ------ | ----------------------------- |
| users.list   | /api/internal/users         | GET    | List all users (cached)       |
| users.get    | /api/internal/users/:userId | GET    | Get a users by its Planhat ID |
| users.create | /api/internal/users         | POST   | Create a new user             |
| users.update | /api/internal/users/:userId | PUT    | Update an existing user       |

The users endpoints are a wrapper around the Planhat API endpoints for Users as documented [here](https://docs.planhat.com/?version=latest#e6b6e1a8-e175-404b-8daf-71554c8c4264).

**Note:** The list endpoint uses a caching mechanism and keeps results up to 10 minutes in the cache. To force cache invalidation, use the querystring parameter `&cacheclear=1`.
