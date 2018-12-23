const Event = require("../../models/event");
const User = require("../../models/user");

const userFetch = async userId => {
  const user = await User.findById(userId);
  return {
    ...user._doc,
    _id: user.id,
    createdEvents: eventsFetch.bind(this, user._doc.createdEvents)
  };
};

const eventsFetch = async ids =>
  (await Event.find({ _id: { $in: ids } }))
    .map(event => {
      console.log(event);
      return event;
    })
    .map(event => ({
      ...event._doc,
      _id: event.id,
      user: userFetch.bind(this, event._doc.creator)
    }));

module.exports = { userFetch, eventsFetch };
