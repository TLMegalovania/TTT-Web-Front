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
  ID: string;
  OwnerName: string;
  GuestName?: string;
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

type Callback = {
  roomCreated: (callback: (id: string, ownerName: string) => void) => void;
  joinedRoom: (callback: (id: string, guestName: string) => void) => void;
  leftRoom: (callback: (id: string) => void) => void;
  roomDeleted: (callback: (id: string) => void) => void;
  gameStarted: (callback: (id: string) => void) => void;
  gameEnded: (callback: (id: string) => void) => void;
  madeMove: (callback: (move: MoveInfo) => void) => void;
};

export { RootState, TurnType, PlayerType };
export type { RoomInfo, MoveInfo, RPC, Callback };
