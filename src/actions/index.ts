import accountUpdate from "./account-update";
import userUpdate from "./user-update";
import fieldsSchema from "./schema-fields";
import { listUsers, getUserById, createUser, updateUser } from "./api-users";
import { statusActionFactory } from "./status";
import { accountFetchFactory } from "./account-fetch";
import { userFetchFactory } from "./user-fetch";

// eslint-disable-next-line import/no-default-export
export default {
  accountUpdate,
  userUpdate,
  fieldsSchema,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  status: statusActionFactory,
  fetchAccounts: accountFetchFactory,
  fetchUsers: userFetchFactory,
};
