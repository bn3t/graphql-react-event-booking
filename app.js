const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");

let events = ["Romantic Cooking", "Sailing", "All-Night Coding"];

const app = express();

app.use(bodyParser.json());
app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(`
        type RootQuery {
            events: [String!]!
        }

        type RootMutation {
            createEvent(name: String): String
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return events;
      },
      createEvent: args => {
        const eventName = args.name;
        events = [...events, eventName];
        return eventName;
      }
    },
    graphiql: true
  })
);
app.listen(3000);
