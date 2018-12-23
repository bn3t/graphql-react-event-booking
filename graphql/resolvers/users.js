const User = require("../../models/user");
const { eventsFetch } = require("./utils");

module.exports = async () =>
  (await User.find()).map(user => ({
    ...user._doc,
    _id: user.id,
    password: undefined,
    createdEvents: eventsFetch.bind(this, user._doc.createdEvents)
  }));
