import React, { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import { LOGIN_MUTATION } from "../queries/Login.graphql";
import { CURRENT_USER_QUERY } from "../queries/CurrentUser.graphql";
import { SIGNUP_MUTATION } from "../queries/SingUp.graphql";

export default () => {
  let loginInp;
  let passwordInp;

  const switchfun = (e) => {
    let id = e.target.id;
    if (id === "reg") {
      document.getElementById("auth").classList.remove("active");
      document.getElementById("reg").classList.add("active");
    }
    if (id === "auth") {
      document.getElementById("reg").classList.remove("active");
      document.getElementById("auth").classList.add("active");
    }
  };

  const [err, setErr] = useState("");

  const [login, { data, error }] = useMutation(LOGIN_MUTATION, {
    update: (cache, { data: { login } }) =>
      cache.writeQuery({
        query: CURRENT_USER_QUERY,
        data: { currentUser: login.user },
      }),
    onError: (data) => {
      console.log("err is: " + data);
      setErr("Неверный логин или пароль");
      document.getElementsByClassName("err")[0].classList.add("err-active");
      setTimeout(() => {
        setErr("");
        document
          .getElementsByClassName("err")[0]
          .classList.remove("err-active");
      }, 2700);
    },
  });
  const [signup] = useMutation(SIGNUP_MUTATION, {
    update: (cache, { data: { signup } }) =>
      cache.writeQuery({
        query: CURRENT_USER_QUERY,
        data: { currentUser: signup.user },
      }),
  });

  const ShowPassword = () => {
    const pass = document.getElementById("pass");
    if (pass.type === "password") {
      pass.type = "text";
    } else {
      pass.type = "password";
    }
  };
  function loginfun(e) {
    e.preventDefault();
    if (document.getElementById("reg").className === "active") {
      if (loginInp.value != "" && passwordInp.value != "") {
        signup({
          variables: { username: loginInp.value, password: passwordInp.value },
        });
      }
    }
    if (document.getElementById("auth").className === "active") {
      if (loginInp.value != "" && passwordInp.value != "") {
        login({
          variables: { username: loginInp.value, password: passwordInp.value },
        });
      }
    }
    loginInp.value = "";
    passwordInp.value = "";
  }

  return (
    <div className="auth">
      <h1 className="err">{err}</h1>
      <div className="box-auth">
        <form method="GET" onSubmit={loginfun} className="form">
          <div className="switch">
            <div id="auth" className="active" onClick={switchfun}>
              Войти
            </div>
            <div id="reg" onClick={switchfun}>
              Зарегистрироваться
            </div>
          </div>
          <input
            placeholder="имя пользователя"
            ref={(node) => {
              loginInp = node;
            }}
          ></input>
          <input
            id="pass"
            type="password"
            autoComplete="false"
            placeholder="пароль"
            ref={(node) => {
              passwordInp = node;
            }}
          ></input>
          <div className="onPass">
            <input id="checkbox" type="checkbox" onClick={ShowPassword}></input>
            <label htmlFor="checkbox"></label>
          </div>
          <div className="submit">
            <input type="submit" value="подтвердить"></input>
            <span className="bg"></span>
          </div>
        </form>
      </div>
      <canvas id="cn"></canvas>
    </div>
  );
};
