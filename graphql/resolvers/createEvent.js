const Event = require("../../models/event");
const User = require("../../models/user");
const { userFetch } = require("./utils");

module.exports = ({ eventInput }) => {
  return Promise.all([
    User.findById(eventInput.creator),
    new Event({
      title: eventInput.title,
      description: eventInput.description,
      price: eventInput.price,
      date: new Date(eventInput.date),
      creator: eventInput.creator
    }).save()
  ])
    .then(([user, event]) => {
      user.createdEvents.push(event);
      return [
        user.save(),
        {
          ...event._doc,
          _id: event.id,
          creator: userFetch.bind(this, event._doc.creator)
        }
      ];
    })
    .then(([_user, event]) => event);
};
