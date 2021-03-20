const express = require("express"),
  cors = require("cors"),
  session = require("express-session"),
  MongoDBStore = require("connect-mongodb-session")(session),
  cookieParser = require("cookie-parser"),
  { ObjectId } = require("mongodb"),
  { ApolloServer, gql } = require("apollo-server-express"),
  { GraphQLLocalStrategy, buildContext } = require("graphql-passport");

const passport = require("passport");

const { v4: uuidv4 } = require("uuid");

// const schemaString = readFileSync("./schema.graphql", { encoding: "utf8" });
// const schema = buildSchema(schemaString);

const mongoose = require("mongoose");
const MongoURL =
  "mongodb+srv://leosh1d:leosh1ddb@cluster0-egd6s.mongodb.net/leosh1ddata?retryWrites=true&w=majority";
mongoose.connect(MongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
mongoose.set("useFindAndModify", false);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const SchemaM = mongoose.Schema;

const UsersSchema = new SchemaM({
  _id: ObjectId,
  username: String,
  password: String,
  todo: Array,
  doing: Array,
  done: Array,
  theme: String,
});

const users = mongoose.model("users", UsersSchema);

let login1, login2;

const app = express();

const corsOptions = {
  origin: "https://leosh1d.github.io/full-stack/",
  credentials: true,
};

app.use(cors(corsOptions));

const sessionMiddleware = session({
  store: MongoDBStore({ uri: MongoURL, collection: "sessions" }),
  genid: (req) => uuidv4(),
  secret: "obeme",
  resave: true,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 20,
  },
});

app.use(cookieParser());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  users.findById(id, function (err, matchingUser) {
    done(err, matchingUser);
  });
});

passport.use(
  new GraphQLLocalStrategy((username, password, done) => {
    let matchingUser;
    users.findOne({ username: username }, function (err, result) {
      if (result != null) login1 = result.username;
    });
    users
      .findOne({ password: password }, function (err, result) {
        if (result != null) login2 = result.username;
      })
      .then(() => {
        if (login1 === login2 && login1 != undefined) {
          users.findOne({ username: username }, function (err, result) {
            matchingUser = result;
            login1 = null;
            login2 = null;
            const error = matchingUser ? null : new Error("no matching user");
            done(error, matchingUser);
          });
        } else {
          const error = matchingUser ? null : new Error("no matching user");
          return error;
        }
      });
  })
);

const typeDefs = gql`
  type User {
    _id: String
    username: String
    password: String
    todo: [String]
    doing: [String]
    done: [String]
    theme: String
  }

  type Query {
    currentUser: User
  }

  type AuthPayload {
    user: User
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload
    logout: Boolean
    signup(username: String!, password: String!): AuthPayload
    addAction(section: String!, data: String!): User
    removeAction(section: String!, data: String!): User
    updateAction(section: String!, data: [String]!): User
    updateTheme(data: String!): User
  }
`;

const resolvers = {
  Query: {
    currentUser: (parent, args, context) => context.getUser(),
  },
  Mutation: {
    signup: async (parent, { username, password }, context) => {
      let userWithUsernameAlreadyExists;
      await users.findOne({ username: username }, function (error, result) {
        userWithUsernameAlreadyExists = !!result;
      });

      if (userWithUsernameAlreadyExists) {
        console.log("err");
        throw new Error("User with username already exists");
      }
      const newUser = new users({
        _id: mongoose.Types.ObjectId(),
        username,
        password,
        todo: [],
        doing: [],
        done: [],
        theme: "0",
      });

      newUser.save(function (err) {
        if (err) return handleError(err);
      });

      context.login(newUser);

      return { user: newUser };
    },
    logout: (parent, args, context) => context.logout(),
    login: async (parent, { username, password }, context) => {
      console.log(username, password);
      const { user } = await context.authenticate("graphql-local", {
        username,
        password,
      });
      console.log("dasdas");
      await context.login(user);
      return { user };
    },
    addAction: async (parent, { section, data }, context) => {
      const UserUpd = context.getUser();
      const Data = data;
      let UserUpd2;
      if (section === "todo") {
        let TODO = UserUpd.todo;
        await TODO.push(Data);
        await users.findOneAndUpdate(
          { _id: UserUpd._id },
          { todo: TODO },
          function (err, result) {
            UserUpd2 = result;
          }
        );
      }
      if (section === "doing") {
        let DOING = UserUpd.doing;
        await DOING.push(Data);
        await users.findOneAndUpdate(
          { _id: UserUpd._id },
          { doing: DOING },
          function (err, result) {
            UserUpd2 = result;
          }
        );
      }
      if (section === "done") {
        let DONE = UserUpd.done;
        await DONE.push(Data);
        await users.findOneAndUpdate(
          { _id: UserUpd._id },
          { done: DONE },
          function (err, result) {
            UserUpd2 = result;
          }
        );
      }
      return users.findOne({ _id: UserUpd._id }, function (err, result) {
        return result;
      });
      // console.log(UserUpd2)
      // return UserUpd2
    },
    removeAction: async (parent, { section, data }, context) => {
      const UserUpd = context.getUser();
      const Data = data;
      let UserUpd2;
      if (section === "todo") {
        let TODO = UserUpd.todo;
        const index = await TODO.indexOf(Data);
        console.log(index);
        if (index > -1) {
          await TODO.splice(index, 1);
          await users.findOneAndUpdate(
            { _id: UserUpd._id },
            { todo: TODO },
            function (err, result) {
              UserUpd2 = result;
            }
          );
        }
      }
      if (section === "doing") {
        let DOING = UserUpd.doing;
        const index = await DOING.indexOf(Data);
        if (index > -1) {
          await DOING.splice(index, 1);
          await users.findOneAndUpdate(
            { _id: UserUpd._id },
            { doing: DOING },
            function (err, result) {
              UserUpd2 = result;
            }
          );
        }
      }
      if (section === "done") {
        let DONE = UserUpd.done;
        const index = await DONE.indexOf(Data);
        if (index > -1) {
          await DONE.splice(index, 1);
          await users.findOneAndUpdate(
            { _id: UserUpd._id },
            { done: DONE },
            function (err, result) {
              UserUpd2 = result;
            }
          );
        }
      }
      return UserUpd2;
    },
    updateAction: async (parent, { section, data }, context) => {
      const UserUpd = context.getUser();
      let UserUpd2, newUser;
      newUser = { ...UserUpd };
      newUser._doc[section] = data;
      console.log(newUser._doc.todo);
      await users.findOneAndUpdate(
        { _id: UserUpd._id },
        { [section]: newUser._doc[section] },
        function (err, result) {
          UserUpd2 = result;
        }
      );
      return newUser._doc;
    },
    updateTheme: async (parent, { data }, context) => {
      const UserUpd = context.getUser();
      let UserUpd2, newUser;
      newUser = { ...UserUpd };
      newUser._doc.theme = data;
      console.log(newUser._doc);
      await users.findOneAndUpdate(
        { _id: UserUpd._id },
        { theme: data },
        function (err, result) {
          UserUpd2 = result;
        }
      );
      return newUser._doc;
    },
  },
};
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => buildContext({ req, res }),
  playground: {
    settings: {
      "request.credentials": "same-origin",
    },
  },
});

server.applyMiddleware({ app, cors: false });
app.listen(4000, () => {
  console.log(
    "🚀 server started, graphql playground: http://localhost:4000/graphql"
  );
});
