import React, { useState } from "react";
import { ADD_ACTION } from "../queries/addAction.graphql";
import { REMOVE_ACTION } from "../queries/removeAction.graphql";
import { UPDATE_ACTION } from "../queries/updateAction.graphql";
import { UPDATE_THEME } from "../queries/updateTheme.graphql";
import { useMutation } from "@apollo/react-hooks";
import { CURRENT_USER_QUERY } from "../queries/CurrentUser.graphql";
import Logout from "./Logout.jsx";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default (props) => {
  let todoInp;
  let DoingInp;
  let DoneInp;
  const [USR, setUSR] = useState(props.user.currentUser);

  const [ADD] = useMutation(ADD_ACTION);

  const [REMOVE] = useMutation(REMOVE_ACTION, {
    refetchQueries: [
      {
        query: CURRENT_USER_QUERY,
      },
    ],
  });

  const [UPDATET] = useMutation(UPDATE_THEME);

  const [UPDATE] = useMutation(UPDATE_ACTION, {});

  const addFun = (event) => {
    event.preventDefault();
    console.log(event.target.id);
    fakeUser = { ...USR };
    let Fake2 = fakeUser[event.target.id].map((item) => {
      return item;
    });

    if (event.target.id === todo) {
      Fake2.push(todoInp.value);
      fakeUser[event.target.id] = Fake2;
      setUSR(fakeUser);
      if (todoInp.value != "") {
        ADD({ variables: { section: event.target.id, data: todoInp.value } });
      }
      todoInp.value = "";
    }
  };

  const addDoingFun = (event) => {
    event.preventDefault();
    props.user.currentUser.doing.push(DoingInp.value);
    if (DoingInp.value != "") {
      ADD({ variables: { section: "doing", data: DoingInp.value } });
    }
    DoingInp.value = "";
  };

  const addDoneFun = (event) => {
    event.preventDefault();
    props.user.currentUser.done.push(DoneInp.value);
    if (DoneInp.value != "") {
      ADD({ variables: { section: "done", data: DoneInp.value } });
    }
    DoneInp.value = "";
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    document.getElementById("del").style.opacity = "0";
    document.getElementById("edit").style.opacity = "0";
    if (!result.destination) {
      return;
    } else {
      if (source.droppableId === destination.droppableId) {
        const items = reorder(
          USR[destination.droppableId],
          result.source.index,
          result.destination.index
        );
        const newTasks = { ...USR };
        newTasks[destination.droppableId] = items;
        setUSR(newTasks);
        UPDATE({
          variables: {
            section: destination.droppableId,
            data: newTasks[destination.droppableId],
          },
        });
      } else {
        if (
          destination.droppableId === "delete" ||
          destination.droppableId === "edit"
        ) {
          if (destination.droppableId === "delete") {
            REMOVE({
              variables: {
                section: source.droppableId,
                data: USR[source.droppableId][source.index],
              },
            });
            // props.user.currentUser[source.droppableId][source.index] = null;
          }
          if (destination.droppableId === "edit") {
            document
              .getElementsByClassName("overlay")[0]
              .classList.add("overlay-active");
            editInp.placeholder =
              props.user.currentUser[source.droppableId][source.index];
            editSource = source.droppableId;
          }
        } else {
          const result = move(
            USR[source.droppableId],
            USR[destination.droppableId],
            source,
            destination
          );
          const newState = { ...USR };
          newState[source.droppableId] = result[source.droppableId];
          newState[destination.droppableId] = result[destination.droppableId];
          setUSR(newState);
          UPDATE({
            variables: {
              section: destination.droppableId,
              data: newState[destination.droppableId],
            },
          });
          UPDATE({
            variables: {
              section: source.droppableId,
              data: newState[source.droppableId],
            },
          });
        }
      }
    }
  };
  const OP = () => {
    document.getElementById("del").style.opacity = "1";
    document.getElementById("edit").style.opacity = "1";
  };
  const OP2 = (event) => {
    event.preventDefault();
    document
      .getElementsByClassName("overlay")[0]
      .classList.remove("overlay-active");
    if (editInp.value != "") {
      UPDATE({
        variables: {
          section: editSource,
          data: editInp.value,
        },
      });
    }
  };
  let fakeUser;
  const ThemeDark = () => {
    UPDATET({
      variables: {
        data: "dark",
      },
    });
    fakeUser = { ...USR };
    fakeUser.theme = "dark";
    setUSR(fakeUser);
  };
  const ThemeWhite = () => {
    fakeUser = { ...USR };
    fakeUser.theme = "";
    setUSR(fakeUser);
    UPDATET({
      variables: {
        data: "",
      },
    });
  };
  let editInp, editSource;

  return (
    <div className={"body" + " " + USR.theme}>
      <div className="user">
        <Logout />
        <div className="theme-selector">
          <span id="theme1" onClick={ThemeDark}></span>
          <span id="theme2" onClick={ThemeWhite}></span>
        </div>
        <div className="username-box">
          <h3>{props.user.currentUser.username}</h3>
        </div>
      </div>
      <div className="container overlay">
        <form onSubmit={OP2}>
          <input
            ref={(node) => {
              editInp = node;
            }}
          ></input>
        </form>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="edit" key="edit">
          {(provided, snapshot) => (
            <div className="delete edit" id="edit">
              Изменить
              <div
                className="container"
                {...provided.droppableProps}
                ref={provided.innerRef}
              ></div>
            </div>
          )}
        </Droppable>
        <Droppable droppableId="todo">
          {(provided, snapshot) => (
            <div className="box2">
              Нужно сделать
              <div
                className="container"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {USR.todo.map((item, index) => (
                  <Draggable draggableId={item + index} index={index}>
                    {(provided, snapshot) => (
                      <li
                        className="card"
                        data={item}
                        section={"todo"}
                        key={item + index}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onMouseDown={OP}
                        onMouseUp={() => {
                          document.getElementById("del").style.opacity = "0";
                          document.getElementById("edit").style.opacity = "0";
                        }}
                      >
                        {item}
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <form onSubmit={addFun} id="todo">
                  <input
                    className="add-input"
                    placeholder="Добавить карточку"
                    ref={(node) => {
                      todoInp = node;
                    }}
                  ></input>
                </form>
              </div>
            </div>
          )}
        </Droppable>
        <Droppable droppableId="doing">
          {(provided, snapshot) => (
            <div className="box2">
              В процессе
              <div
                className="container"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {USR.doing.map((item, index) => (
                  <Draggable draggableId={item + index} index={index}>
                    {(provided, snapshot) => (
                      <li
                        className="card"
                        data={item}
                        section={"doing"}
                        key={item + index}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onMouseDown={OP}
                      >
                        {item}
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <form onSubmit={addDoingFun}>
                  <input
                    className="add-input"
                    placeholder="Добавить карточку"
                    ref={(node) => {
                      DoingInp = node;
                    }}
                  ></input>
                </form>
              </div>
            </div>
          )}
        </Droppable>
        <Droppable droppableId="done">
          {(provided, snapshot) => (
            <div className="box2">
              Сделано
              <div
                className="container"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {USR.done.map((item, index) => (
                  <Draggable draggableId={item + index} index={index}>
                    {(provided, snapshot) => (
                      <li
                        className="card "
                        data={item}
                        section={"done"}
                        key={item + index}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onMouseDown={OP}
                      >
                        {item}
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <form onSubmit={addDoneFun}>
                  <input
                    className="add-input"
                    placeholder="Добавить карточку"
                    ref={(node) => {
                      DoneInp = node;
                    }}
                  ></input>
                </form>
              </div>
            </div>
          )}
        </Droppable>
        <Droppable droppableId="delete">
          {(provided, snapshot) => (
            <div className="delete" id="del">
              Удалить
              <div
                className="container"
                {...provided.droppableProps}
                ref={provided.innerRef}
              ></div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
