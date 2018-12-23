const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Event = require("./models/event");
const User = require("./models/user");

const app = express();

const userFetch = userId =>
  User.findById(userId).then(user => ({
    ...user._doc,
    _id: user.id,
    createdEvents: eventsFetch.bind(this, user._doc.createdEvents)
  }));

const eventsFetch = ids =>
  Event.find({ _id: { $in: ids } }).then(events =>
    events.map(event => ({
      ...event,
      _id: event.id,
      user: userFetch.bind(this, event.creator)
    }))
  );

app.use(bodyParser.json());
app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }

        type User {
            _id: ID!
            email: String!
            password: String
            createdEvents: [Event!]!
        }

        type RootQuery {
            events: [Event!]!
            users: [User!]!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: ID!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return Event.find()
          .then(result => {
            return result.map(event => ({
              ...event._doc,
              _id: event.id,
              creator: userFetch.bind(this, event.creator._id)
            }));
          })
          .catch(err => {
            throw err;
          });
      },
      users: () =>
        User.find().then(result =>
          result.map(user => ({
            ...user._doc,
            _id: user.id,
            password: undefined,
            createdEvents: eventsFetch.bind(this, user._doc.createdEvents)
          }))
        ),
      createEvent: ({ eventInput }) => {
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
            console.log("user", user);
            console.log("event", event);
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
      },
      createUser: ({ userInput }) =>
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
          })
    },
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASSWORD
    }@cluster0-psshp.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
  )
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
