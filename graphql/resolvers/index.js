const events = require("./events");
const users = require("./users");
const createEvent = require("./createEvent");
const createUser = require("./createUser");

const rootValue = {
  events,
  users,
  createEvent,
  createUser
};

module.exports = rootValue;
