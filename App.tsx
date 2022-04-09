import { FC, useState } from "react";
import { render } from "react-dom";
import { HubConnectionBuilder, IStreamResult } from "@microsoft/signalr";

enum RootState {
  None,
  LoggedIn,
  AsOwner,
  AsGuest,
  AsAudience,
}

enum TurnType {
  Null,
  Black,
  White,
  Tie,
}

type RoomInfo = {
  ID: string;
  OwnerName: string;
  GuestName: string | null;
  GameStarted: boolean;
};

type MoveInfo = {
  x: number;
  y: number;
  Turn: TurnType;
  Result: TurnType;
};

type RPC = {
  login: (username: string) => Promise<void>;
  getRooms: () => IStreamResult<RoomInfo>;
  createRoom: () => Promise<boolean>;
  joinRoom: (id: string) => Promise<boolean>;
  leaveRoom: () => Promise<void>;
  deleteRoom: () => Promise<void>;
  startGame: (rows: number, cols: number) => Promise<void>;
  endGame: () => Promise<void>;
  getBoard: () => IStreamResult<TurnType[]>;
  makeMove: (x: number, y: number) => Promise<boolean>;
};

const App: FC = () => {
  const connection = new HubConnectionBuilder().withUrl("/api").build();
  const [username, setUsername] = useState("");
  const rpc: RPC = {
    login: async (username) => await connection.invoke("Login", username),
    getRooms: () => connection.stream("GetRooms"),
    createRoom: () => connection.invoke("CreateRoom"),
    joinRoom: (id) => connection.invoke("JoinRoom", id),
    leaveRoom: () => connection.invoke("LeaveRoom"),
    deleteRoom: () => connection.invoke("DeleteRoom"),
    startGame: (rows, cols) => connection.invoke("StartGame", rows, cols),
    endGame: () => connection.invoke("EndGame"),
    getBoard: () => connection.stream("GetBoard"),
    makeMove: (x, y) => connection.invoke("MakeMove", x, y),
  };
  const [rootState, setRootState] = useState(RootState.None);
  return null;
};

render(<App />, document.getElementById("root"));

export { RootState };
export type { RPC };
