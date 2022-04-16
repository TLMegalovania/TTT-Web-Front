import { FC } from "react";
import { RootState, RPC, PlayerType, TurnType } from "./Types";

type Props = {
  setRootState: (state: RootState) => void;
  setRoomId: (id: string) => void;
  owner: string;
  guest?: string;
  playerType: PlayerType;
  nextTurnType: PlayerType;
  board: TurnType[][];
  rpc: RPC;
};

const Room: FC<Props> = (props) => {
  return (
    <>
      <button
        onClick={() => {
          if (props.nextTurnType != PlayerType.Null) props.rpc.endGame();
          if (props.playerType == PlayerType.Guest) props.rpc.leaveRoom();
          else props.rpc.deleteRoom();
          props.setRootState(RootState.LoggedIn);
          props.setRoomId(null);
        }}
      >
        Leave
      </button>
      <div>Owner: {props.owner}</div>
      <div>Guest: {props.guest}</div>
      {props.nextTurnType != PlayerType.Null ? (
        <div className="status">
          Next: {props.nextTurnType === PlayerType.Owner ? "⚫" : "⚪"}
        </div>
      ) : props.playerType == PlayerType.Owner ? (
        <button
          onClick={() => {
            props.rpc.startGame(5, 5);
          }}
        >
          Start
        </button>
      ) : null}
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="board-row">
          {[0, 1, 2, 3, 4].map((j) => {
            const value = props.board[i][j];
            const myTurn = props.playerType == props.nextTurnType;
            return (
              <button
                className="square"
                onClick={() => {
                  if (!myTurn || value != TurnType.Null) return;
                  if (myTurn && value == TurnType.Null) {
                    props.rpc.makeMove(i, j);
                  }
                }}
                key={j}
              >
                {value == TurnType.Black
                  ? "⚫"
                  : value == TurnType.White
                  ? "⚪"
                  : null}
              </button>
            );
          })}
        </div>
      ))}
    </>
  );
};

export { Room };
