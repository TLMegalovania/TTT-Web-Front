import { IStreamResult } from "@microsoft/signalr";

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

enum PlayerType {
  Null,
  Owner,
  Guest,
  Audience,
}

type RoomInfo = {
  id: string;
  ownerName: string;
  guestName?: string;
  gameStarted: boolean;
};

type MoveInfo = {
  x: number;
  y: number;
  turn: TurnType;
  result: TurnType;
};

type RPC = {
  login: (username: string) => Promise<void>;
  createRoom: () => Promise<string>;
  joinRoom: (id: string) => Promise<boolean>;
  leaveRoom: () => Promise<void>;
  deleteRoom: () => Promise<void>;
  startGame: (rows: number, cols: number) => Promise<void>;
  endGame: () => Promise<void>;
  getBoard: () => IStreamResult<TurnType[]>;
  makeMove: (x: number, y: number) => Promise<boolean>;
};

export { RootState, TurnType, PlayerType };
export type { RoomInfo, MoveInfo, RPC };
