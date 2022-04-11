import { FC, useState } from "react";
import { render } from "react-dom";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { Index } from "./Index";
import { Hall } from "./Hall";
import { Callback, PlayerType, RootState, RPC } from "./Types";
import { Room } from "./Room";

const App: FC = () => {
  const connection = new HubConnectionBuilder().withUrl("/api").build();
  connection.start().catch((err) => console.error(err));
  const [username, setUsername] = useState("");
  const [rootState, setRootState] = useState(RootState.None);
  const [ownerName, setOwnerName] = useState("");
  const [guestName, setGuestName] = useState("");
  const [roomId, setRoomId] = useState("");
  const rpc: RPC = {
    login: (username) => connection.invoke("login", username),
    getRooms: () => connection.stream("getRooms"),
    createRoom: () => connection.invoke("createRoom"),
    joinRoom: (id) => connection.invoke("joinRoom", id),
    leaveRoom: () => connection.invoke("leaveRoom"),
    deleteRoom: () => connection.invoke("deleteRoom"),
    startGame: (rows, cols) => connection.invoke("startGame", rows, cols),
    endGame: () => connection.invoke("endGame"),
    getBoard: () => connection.stream("getBoard"),
    makeMove: (x, y) => connection.invoke("makeMove", x, y),
  };
  const callback: Callback = {
    roomCreated: (callback) => {
      connection.off("roomCreated");
      connection.on("roomCreated", callback);
    },
    joinedRoom: (callback) => {
      connection.off("joinedRoom");
      connection.on("joinedRoom", callback);
    },
    leftRoom: (callback) => {
      connection.off("leftRoom");
      connection.on("leftRoom", callback);
    },
    roomDeleted: (callback) => {
      connection.off("roomDeleted");
      connection.on("roomDeleted", callback);
    },
    gameStarted: (callback) => {
      connection.off("gameStarted");
      connection.on("gameStarted", callback);
    },
    gameEnded: (callback) => {
      connection.off("gameEnded");
      connection.on("gameEnded", callback);
    },
    madeMove: (callback) => {
      connection.off("madeMove");
      connection.on("madeMove", callback);
    },
  };
  let page: JSX.Element | null = null;
  switch (rootState) {
    case RootState.None:
      page = (
        <Index
          setRootState={setRootState}
          setUsername={setUsername}
          rpc={rpc}
        />
      );
      break;
    case RootState.LoggedIn:
      page = (
        <Hall
          username={username}
          rpc={rpc}
          setRootState={setRootState}
          callback={callback}
          setOwnerName={setOwnerName}
          setGuestName={setGuestName}
          setRoomId={setRoomId}
        />
      );
      break;
    case RootState.AsOwner:
    case RootState.AsGuest:
    case RootState.AsAudience:
      page = (
        <Room
          owner={ownerName}
          guest={guestName}
          rpc={rpc}
          setRootState={setRootState}
          playerType={
            username === ownerName
              ? PlayerType.Owner
              : username === guestName
              ? PlayerType.Guest
              : PlayerType.Audience
          }
          callback={callback}
          id={roomId}
        />
      );
      break;
  }
  return page;
};

render(<App />, document.getElementById("root"));
