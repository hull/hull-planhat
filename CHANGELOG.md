# Changelog

## Version 0.1.7 [BETA]

- [bugfix] Exclude field `createDate` from update detection in `PatchUtil`
- [feature] Add status endpoint for Hull platform
- [maintenance] Update manifest defaults to reflect latest mapping strategy

## Version 0.1.6 [BETA]

- [maintenance] Add unit and integration tests to automate manual tests
- [maintenance] Prepare code base for status endpoint reporting and metrics
- [maintenance] Updated documentation to reflect new features and maintenance
- [feature] Add synchronization of licenses for companies
- [feature] Add schema for license properties

## Version 0.1.5 [BETA]

- [bugfix] Add batch handler with proper initialization for accounts
- [bugfix] Load Planhat users also on account lane handler

## Version 0.1.4 [BETA]

- [bugfix] Added `batch-accounts` to manifest which allows manual batch operations for accounts
- [bugfix] Immediately store account result in Hull when synchronizing accounts out to Planhat
- [bugfix] Case-insensitive comparison of name for users by patch-util to avoid alteration by Planhat

## Version 0.1.3 [BETA]

- [feature] Added cache buster to create and update endpoints
- [maintenance] Updated changelog with all previously released ALPHA and BETA version

## Version 0.1.2 [BETA]

- [feature] Exposed internal API to manage users
- [feature] Added Owner and Co-Owner fields to account mappings
- [maintenance] Updated several namings to stay compliant with Planhat
- [maintenance] Updated documentation to reflect new features and maintenance
- [maintenance] Updated codebase to configurable stack
- [maintenance] Updated dependencies

## Version 0.1.1 [BETA]

- [feature] Reworked synchronization lanes which require `externalId` for reliable sync
- [testing] Broken tests due to new logic, will be fixed in a future release; extensive manual testing

## Version 0.1.0 [ALPHA]

- [feature] Created MVP
