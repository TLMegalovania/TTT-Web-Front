import { FC } from "react";
import { RoomInfo, RootState, RPC } from "./Types";

type Props = {
  setRootState: (state: RootState) => void;
  setRoomId: (id: string) => void;
  rooms: RoomInfo[];
  username: string;
  rpc: RPC;
};

const Hall: FC<Props> = (props) => {
  return (
    <>
      <h2>Hello, {props.username}!</h2>
      <button onClick={() => props.setRootState(RootState.None)}>Logout</button>
      <button
        onClick={() => {
          props.rpc.createRoom().then((id) => {
            props.setRootState(RootState.AsOwner);
            props.setRoomId(id);
          });
        }}
      >
        Host
      </button>
      <ul>
        {props.rooms.map((room) => (
          <li
            onClick={() => {
              props.rpc.joinRoom(room.id).then((asGuest) => {
                props.setRootState(
                  asGuest ? RootState.AsGuest : RootState.AsAudience
                );
                props.setRoomId(room.id);
              });
            }}
            key={room.id}
          >
            <span>Owner: {room.ownerName}</span>
            {room.guestName ? <span>Guest: {room.guestName}</span> : null}
            {room.gameStarted ? <span>In Game</span> : null}
          </li>
        ))}
      </ul>
    </>
  );
};

export { Hall };
