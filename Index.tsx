import { FC, useRef } from "react";
import { RootState, RPC } from "./Types";

type Props = {
  setRootState: (state: RootState) => void;
  setUsername: (username: string) => void;
  rpc: RPC;
};

const Index: FC<Props> = (props) => {
  const inputRef = useRef<HTMLInputElement>();
  return (
    <>
      <h1>Tic Tac Toe</h1>
      <input type="text" ref={inputRef} required placeholder="Username" />
      <button
        onClick={() => {
          const username = inputRef.current.value;
          if (!username || username == "") {
            alert("Please enter a username");
            return;
          }
          props.rpc.login(username).then(() => {
            props.setUsername(username);
            props.setRootState(RootState.LoggedIn);
          });
        }}
      >
        Login
      </button>
    </>
  );
};

export { Index };
