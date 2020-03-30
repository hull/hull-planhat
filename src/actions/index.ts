import accountUpdate from "./account-update";
import userUpdate from "./user-update";
import fieldsSchema from "./schema-fields";
import { listUsers, getUserById, createUser, updateUser } from "./api-users";

// eslint-disable-next-line import/no-default-export
export default {
  accountUpdate,
  userUpdate,
  fieldsSchema,
  listUsers,
  getUserById,
  createUser,
  updateUser,
};
