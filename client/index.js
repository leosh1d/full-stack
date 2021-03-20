import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import { InMemoryCache } from "@apollo/client";
import "./index.sass";
import "./theme1.sass";
import App from "./components/App.jsx";

const client = new ApolloClient({
  uri: "https://leosh1d.herokuapp.com/graphql",
  credentials: "include",
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);
