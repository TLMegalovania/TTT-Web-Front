import { FC, useState } from "react";
import { RootState, RPC, PlayerType, Callback, TurnType } from "./Types";

type Props = {
  setRootState: (state: RootState) => void;
  owner: string;
  guest: string;
  playerType: PlayerType;
  rpc: RPC;
  callback: Callback;
  id: string;
};

type SquareProp = {
  value?: string;
  onClick: () => void;
  disabled: boolean;
};

const Square: FC<SquareProp> = (props) => {
  return (
    <button
      className="square"
      onClick={props.onClick}
      disabled={props.disabled ? true : props.value != null}
    >
      {props.value}
    </button>
  );
};

const Room: FC<Props> = (props) => {
  const [nextTurn, setNextTurn] = useState(PlayerType.Null);
  const [guest, setGuest] = useState(props.guest);
  // const oppositeTurn = () =>
  //   setNextTurn((old) =>
  //     old === PlayerType.Owner ? PlayerType.Guest : PlayerType.Owner
  //   );
  const [squares, setSquares] = useState<string[]>(Array(25).fill(null));
  props.callback.gameStarted((id) => {
    if (id !== props.id) return;
    setNextTurn(PlayerType.Owner);
    setSquares(Array(25).fill(null));
  });
  props.callback.gameEnded((id) => {
    if (id !== props.id) return;
    setNextTurn(PlayerType.Null);
  });
  props.callback.joinedRoom((id, newGuest) => {
    if (id !== props.id) return;
    setGuest(newGuest);
  });
  props.callback.leftRoom((id) => {
    if (id !== props.id) return;
    setGuest(null);
  });
  props.callback.roomDeleted((id) => {
    if (id !== props.id) return;
    alert("Room owner left.");
    props.setRootState(RootState.LoggedIn);
  });
  props.callback.madeMove((move) => {
    setSquares((old) => {
      const newSquares = [...old];
      switch (move.Turn) {
        case TurnType.Black:
          newSquares[move.x * 5 + move.y] = "⚫";
          setNextTurn(PlayerType.Guest);
          break;
        case TurnType.White:
          newSquares[move.x * 5 + move.y] = "⚪";
          setNextTurn(PlayerType.Owner);
          break;
      }
      return newSquares;
    });
    if (move.Result != TurnType.Null) setNextTurn(PlayerType.Null);
  });
  if (props.playerType === PlayerType.Audience) {
    props.rpc.getBoard().subscribe({
      next: (board) => {
        setSquares((oldSquares) => {
          const newSquares = [...oldSquares];
          for (let i = 0; i < 25; i++) {
            switch (board[i]) {
              case TurnType.Black:
                newSquares[i] = "⚫";
                break;
              case TurnType.White:
                newSquares[i] = "⚪";
                break;
            }
          }
          return newSquares;
        });
      },
      complete: () => {
        let blackCount = 0,
          whiteCount = 0;
        squares.forEach((square) => {
          if (square === "⚫") blackCount++;
          if (square === "⚪") whiteCount++;
        });
        if (blackCount > whiteCount) {
          setNextTurn(PlayerType.Guest);
        } else {
          setNextTurn(PlayerType.Owner);
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  return (
    <>
      <span>Owner: {props.owner}</span>
      <span>Guest: {guest}</span>
      {nextTurn != PlayerType.Null ? (
        <div className="status">
          Next: {nextTurn === PlayerType.Owner ? "⚫" : "⚪"}
        </div>
      ) : props.playerType == PlayerType.Owner ? (
        <button
          onClick={() => {
            props.rpc.startGame(5, 5);
            // .then(() => setNextTurn(PlayerType.Owner));
          }}
        >
          Start
        </button>
      ) : null}
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="board-row">
          {[0, 1, 2, 3, 4].map((j) => (
            <Square
              key={j}
              value={squares[i * 5 + j]}
              onClick={() => {
                props.rpc.makeMove(i, j);
                // .then((succeeded) => {
                //   if (succeeded) {
                //     setSquares((old) => {
                //       const newSquares = [...old];
                //       newSquares[i * 5 + j] =
                //         nextTurn === PlayerType.Owner ? "⚫" : "⚪";
                //       return newSquares;
                //     });
                //     oppositeTurn();
                //   }
                // });
              }}
              disabled={
                props.playerType == PlayerType.Audience ||
                nextTurn != props.playerType
              }
            />
          ))}
        </div>
      ))}
    </>
  );
};

export { Room };
