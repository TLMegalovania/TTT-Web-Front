import { FC, useEffect, useMemo, useState } from "react";
import { render } from "react-dom";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { Index } from "./Index";
import { Hall } from "./Hall";
import { Room } from "./Room";

import {
  MoveInfo,
  PlayerType,
  RoomInfo,
  RootState,
  RPC,
  TurnType,
} from "./Types";

const App: FC = () => {
  const emptyBoard = Array(5)
    .fill(null)
    .map(() => Array<TurnType>(5).fill(TurnType.Null));
  const [board, setBoard] = useState<TurnType[][]>(emptyBoard);
  const [username, setUsername] = useState<string>();
  const [rootState, setRootState] = useState(RootState.None);
  const [roomId, setRoomId] = useState<string>();
  const [rooms, setRooms] = useState<Map<string, RoomInfo>>(new Map());
  const [playerType, setPlayerType] = useState(PlayerType.Null);
  const [nextTurnType, setNextTurnType] = useState(PlayerType.Null);
  const [ownerName, setOwnerName] = useState<string>();
  const [guestName, setGuestName] = useState<string>();
  const rpc: RPC = {
    login: (username) => connection.invoke("login", username),
    createRoom: () => connection.invoke("createRoom"),
    joinRoom: (id) => connection.invoke("joinRoom", id),
    leaveRoom: () => connection.invoke("leaveRoom"),
    deleteRoom: () => connection.invoke("deleteRoom"),
    startGame: (rows, cols) => connection.invoke("startGame", rows, cols),
    endGame: () => connection.invoke("endGame"),
    getBoard: () => connection.stream("getBoard"),
    makeMove: (x, y) => connection.invoke("makeMove", x, y),
  };
  const connection = useMemo(() => {
    const connection = new HubConnectionBuilder().withUrl("/api/hub").build();
    connection.start().then(() => {
      connection.stream("getRooms").subscribe({
        next: (room: RoomInfo) => {
          setRooms((rooms) => {
            const newRooms = new Map(rooms);
            newRooms.set(room.id, room);
            console.log(newRooms);
            return newRooms;
          });
        },
        complete: () => {},
        error: (error) => console.error(error),
      });
    });
    return connection;
  }, []);
  useEffect(() => {
    connection.on("roomCreated", (id: string, ownerName: string) => {
      setRooms((oldRooms) => {
        const newRooms = new Map(oldRooms);
        newRooms.set(id, {
          id: id,
          ownerName: ownerName,
          gameStarted: false,
        });
        return newRooms;
      });
    });
    connection.on("madeMove", (move: MoveInfo) => {
      console.log(move);
      setBoard((oldBoard) => {
        const newBoard = oldBoard.map((row) => [...row]);
        newBoard[move.x][move.y] = move.turn;
        return newBoard;
      });
      switch (move.turn) {
        case TurnType.Black:
          setNextTurnType(PlayerType.Guest);
          break;
        case TurnType.White:
          setNextTurnType(PlayerType.Owner);
          break;
      }
      switch (move.result) {
        case TurnType.Black:
          alert("Black Win");
          break;
        case TurnType.White:
          alert("White Win");
          break;
        case TurnType.Tie:
          alert("Tie");
          break;
      }
    });
  }, []);
  useEffect(() => {
    connection.on("joinedRoom", (id: string, guestName: string) => {
      setRooms((oldRooms) => {
        const room = oldRooms.get(id);
        if (room == null) return oldRooms;
        const newRooms = new Map(oldRooms);
        newRooms.set(id, {
          ...room,
          guestName: guestName,
        });
        return newRooms;
      });
      if (id == roomId) {
        setGuestName(guestName);
      }
    });
    connection.on("leftRoom", (id: string) => {
      setRooms((oldRooms) => {
        const room = oldRooms.get(id);
        if (room == null) return oldRooms;
        const newRooms = new Map(oldRooms);
        newRooms.set(id, {
          ...room,
          guestName: null,
        });
        return newRooms;
      });
      if (id == roomId) {
        setGuestName(null);
      }
    });
    connection.on("roomDeleted", (id: string) => {
      setRooms((oldRooms) => {
        if (oldRooms.delete(id)) {
          return new Map(oldRooms);
        }
        return oldRooms;
      });
      if (id == roomId) {
        setRoomId(null);
      }
    });
    connection.on("gameStarted", (id: string) => {
      setRooms((oldRooms) => {
        const room = oldRooms.get(id);
        if (room == null) return oldRooms;
        const newRooms = new Map(oldRooms);
        newRooms.set(id, {
          ...room,
          gameStarted: true,
        });
        return newRooms;
      });
      if (id == roomId) {
        setBoard(emptyBoard);
        setNextTurnType(PlayerType.Owner);
      }
    });
    connection.on("gameEnded", (id: string) => {
      setRooms((oldRooms) => {
        const room = oldRooms.get(id);
        if (room == null) return oldRooms;
        const newRooms = new Map(oldRooms);
        newRooms.set(id, {
          ...room,
          gameStarted: false,
        });
        return newRooms;
      });
      if (id == roomId) setNextTurnType(PlayerType.Null);
    });
    return () => {
      connection.off("joinedRoom");
      connection.off("leftRoom");
      connection.off("roomDeleted");
      connection.off("gameStarted");
      connection.off("gameEnded");
    };
  }, [roomId]);
  useEffect(() => {
    if (rootState === RootState.LoggedIn) {
      setRoomId(null);
    }
    if (rootState != RootState.AsAudience) return;
    const theBoard = new Array<TurnType[]>();
    rpc.getBoard().subscribe({
      next: (row) => {
        theBoard.push(row);
      },
      complete: () => {
        setBoard((oldBoard) => {
          const newBoard = oldBoard.map((row) => [...row]);
          theBoard.forEach((row, i) => {
            row.forEach((cell, j) => {
              if (cell != TurnType.Null) newBoard[i][j] = cell;
            });
          });
          return newBoard;
        });
      },
      error: (error) => console.error(error),
    });
    return () => setBoard(emptyBoard);
  }, [rootState]);
  useEffect(() => {
    const room = rooms.get(roomId);
    if (!room) {
      return;
    }
    setOwnerName(room.ownerName);
    setGuestName(room.guestName);
    switch (rootState) {
      case RootState.AsOwner:
        setPlayerType(PlayerType.Owner);
        break;
      case RootState.AsGuest:
        setPlayerType(PlayerType.Guest);
        break;
      case RootState.AsAudience:
        setPlayerType(PlayerType.Audience);
        break;
      default:
        setPlayerType(PlayerType.Null);
        break;
    }
  }, [roomId]);
  switch (rootState) {
    case RootState.None:
      return (
        <Index
          rpc={rpc}
          setRootState={setRootState}
          setUsername={setUsername}
        />
      );
    case RootState.LoggedIn:
      return (
        <Hall
          rpc={rpc}
          setRootState={setRootState}
          setRoomId={setRoomId}
          rooms={Array.from(rooms.values())}
          username={username}
        />
      );
    case RootState.AsOwner:
    case RootState.AsGuest:
    case RootState.AsAudience:
      return (
        <Room
          rpc={rpc}
          board={board}
          playerType={playerType}
          setRootState={setRootState}
          owner={ownerName}
          guest={guestName}
          nextTurnType={nextTurnType}
        />
      );
  }
};

render(<App />, document.getElementById("root"));
