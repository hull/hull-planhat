# hull-planhat

![Node.js CI](https://github.com/SMK1085/hull-planhat/workflows/Node.js%20CI/badge.svg)

Hull connector for planhat.com

## Features

### User Synchronization

The Planhat Connector allows you to synchronize Hull User Profiles to Planhat EndUser objects. Currently Hull to Planhat is the only supported direction for the data flow.

To establish a reliable synchronization, the following restrictions had to be put in place:

- Hull Users need to be linked to Accounts with `external_id`
- Hull Users need to have an email address which is unique

The synchronization logic is implemented as described below:

#### Matching Logic

Hull Users are matched to Planhat EndUsers with the email address. If an EndUsers with a matching email is found in Planhat, the Connector will perform an update, if no matching EndUser is found the connector will perform an insert. There is no normalization or any other manipulation of the email address implemented, the string is taken as-is.

#### Update Logic

The Connector will only perform an update operation against the Planhat API if any of the synchronized attributes has changed. This is to prevent circular infinite data flows, because Planhat will modify the timestamp `updatedAt` regardless whether there has been a change or not.

Performing a batch send operation for users will bypass the change detection and send all users in said batch to the API.
One can leverage this fact to force a synchronization between Hull and Planhat in the absence of a reliable scheduled synchronization.

### Account Synchronization

TBD

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
