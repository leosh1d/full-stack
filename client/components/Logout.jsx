import React from "react";
import { useMutation } from "@apollo/react-hooks";

import * as CURRENT_USER_QUERY from "../queries/CurrentUser.graphql";
import { LOGOUT_MUTATION } from "../queries/logout.graphql";

const LogoutButton = () => {
  const [logout] = useMutation(LOGOUT_MUTATION, {
    update: (cache) =>
      cache.writeQuery({
        query: CURRENT_USER_QUERY,
        data: { currentUser: null },
      }),
  });

  return <button onClick={logout}>Выйти</button>;
};

export default LogoutButton;
