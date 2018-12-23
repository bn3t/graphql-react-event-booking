const Event = require("../../models/event");
const { userFetch } = require("./utils");

module.exports = async () => {
  return (await Event.find()).map(event => ({
    ...event._doc,
    _id: event.id,
    date: new Date(event._doc.date).toISOString(),
    creator: userFetch.bind(this, event.creator._id)
  }));
};
