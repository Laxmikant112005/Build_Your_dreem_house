 /**
  * Planova - User Roles
  */

const ROLE = Object.freeze({
  USER: 'user',
  ENGINEER: 'engineer',
  ADMIN: 'admin',
});

const USER_ROLES = Object.freeze(Object.values(ROLE));

module.exports = {
  ROLE,
  USER_ROLES,
};