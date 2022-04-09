import { FC } from "react";
import { RootState } from "./App";
import type { RPC } from "./App";

type Props = {
  setRootState: (state: RootState) => void;
  username: string;
  rpc: RPC;
};

const Hall: FC<Props> = (props) => {
  return (
    <>
      <h2>Hello, {props.username}!</h2>
    </>
  );
};

export default Hall;
