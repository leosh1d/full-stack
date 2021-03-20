import React from "react";
import Auth from "./Auth.jsx";
import Body from "./Body.jsx";
import * as CURRENT_USER_QUERY from "../queries/CurrentUser.graphql";
import { useQuery } from "@apollo/react-hooks";

export default () => {
  const { loading, error, data } = useQuery(CURRENT_USER_QUERY);
  if (loading) return <div>Loading</div>;
  if (error) return <div>Error: {JSON.stringify(error)}</div>;

  const isLoggedIn = !!data.currentUser;

  function Greeting(props) {
    if (props.isLoggedIn) {
      return <Body user={props.user} />;
    } else {
      return <Auth />;
    }
  }
  return (
    <div className="box">
      <Greeting isLoggedIn={isLoggedIn} user={data} />
    </div>
  );
};
