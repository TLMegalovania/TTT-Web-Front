import { FC, useRef } from "react";
import { RootState } from "./App";

type Props = {
  setRootState: (state: RootState) => void;
  setUsername: (username: string) => void;
};

const Index: FC<Props> = (props) => {
  const inputRef = useRef<HTMLInputElement>();
  return (
    <>
      <h1>Tic Tac Toe</h1>
      <input type="text" ref={inputRef} required placeholder="Username" />
      <button
        onClick={() => {
          props.setUsername(inputRef.current.value);
          props.setRootState(RootState.LoggedIn);
        }}
      >
        Login
      </button>
    </>
  );
};

export default Index;
