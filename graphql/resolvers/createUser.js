const bcrypt = require("bcryptjs");

const User = require("../../models/user");

module.exports = ({ userInput }) =>
  User.findOne({ email: userInput.email })
    .then(user => {
      if (user) {
        throw new Error("User exists already.");
      }
    })
    .then(() => bcrypt.hash(userInput.password, 12))
    .then(hashedPassword =>
      new User({
        email: userInput.email,
        password: hashedPassword
      }).save()
    )
    .then(result => {
      return { ...result._doc, _id: result.id, password: undefined };
    })
    .catch(err => {
      throw err;
    });
