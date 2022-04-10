import { FC, useState } from "react";
import { Callback, RootState, RPC } from "./Types";

type Props = {
  setRootState: (state: RootState) => void;
  setOwnerName: (name: string) => void;
  setGuestName: (name: string) => void;
  setRoomId: (id: string) => void;
  username: string;
  rpc: RPC;
  callback: Callback;
};

type ElementProp = {
  owner: string;
  guest?: string;
  started: boolean;
  rpc: RPC;
  setRootState: (state: RootState) => void;
  setGuestSelfName: () => void;
  setGuestName: (name: string) => void;
  setOwnerName: (name: string) => void;
  setRoomId: (id: string) => void;
  id: string;
};

const Element: FC<ElementProp> = (props) => (
  <li
    onClick={() => {
      props.rpc.joinRoom(props.id).then((asGuest) => {
        props.setRootState(asGuest ? RootState.AsGuest : RootState.AsAudience);
        props.setOwnerName(props.owner);
        props.setRoomId(props.id);
        if (asGuest) props.setGuestSelfName();
        // Evil !
        else props.setGuestName(props.guest!);
      });
    }}
  >
    <span>Owner: {props.owner}</span>
    {props.guest ? <span>Guest: {props.guest}</span> : null}
    {props.started ? <span>In Game</span> : null}
  </li>
);

const Hall: FC<Props> = (props) => {
  const [rooms, setRooms] = useState<JSX.Element[]>([]);
  const [eleProps, setEleProps] = useState<Map<string, ElementProp>>(new Map());
  const addRoom = (id: string, owner: string, guest?: string) => {
    setEleProps((oldProps) => {
      const newProps = new Map(oldProps);
      newProps.set(id, {
        owner,
        guest,
        rpc: props.rpc,
        setRootState: props.setRootState,
        id,
        started: false,
        setGuestSelfName: () => props.setGuestName(props.username),
        setOwnerName: props.setOwnerName,
        setGuestName: props.setGuestName,
        setRoomId: props.setRoomId,
      });
      return newProps;
    });
    setRooms((oldRooms) => {
      const theProp = eleProps.get(id);
      return [
        <Element
          key={theProp.id}
          owner={theProp.owner}
          guest={theProp.guest}
          rpc={theProp.rpc}
          setRootState={theProp.setRootState}
          id={theProp.id}
          started={theProp.started}
          setGuestSelfName={theProp.setGuestSelfName}
          setOwnerName={theProp.setOwnerName}
          setGuestName={theProp.setGuestName}
          setRoomId={theProp.setRoomId}
        />,
        ...oldRooms,
      ];
    });
  };
  props.callback.roomCreated(addRoom);
  props.callback.roomDeleted((id) => {
    setRooms((oldRooms) => oldRooms.filter((room) => room.key !== id));
    setEleProps((oldProps) => {
      const newProps = new Map(oldProps);
      newProps.delete(id);
      return newProps;
    });
  });
  props.callback.joinedRoom((id, guest) => {
    setEleProps((oldProps) => {
      const newProps = new Map(oldProps);
      newProps.get(id).guest = guest;
      return newProps;
    });
  });
  props.callback.leftRoom((id) => {
    setEleProps((oldProps) => {
      const newProps = new Map(oldProps);
      newProps.get(id).guest = undefined;
      return newProps;
    });
  });
  props.callback.gameStarted((id) => {
    setEleProps((oldProps) => {
      const newProps = new Map(oldProps);
      newProps.get(id).started = true;
      return newProps;
    });
  });
  props.callback.gameEnded((id) => {
    setEleProps((oldProps) => {
      const newProps = new Map(oldProps);
      newProps.get(id).started = false;
      return newProps;
    });
  });
  props.rpc.getRooms().subscribe({
    next: (room) => {
      addRoom(room.ID, room.OwnerName, room.GuestName);
    },
    complete: () => {},
    error: (error) => console.error(error),
  });
  return (
    <>
      <h2>Hello, {props.username}!</h2>
      <button
        onClick={() => {
          props.rpc.createRoom().then(() => {
            props.setRootState(RootState.AsOwner);
            props.setOwnerName(props.username);
          });
        }}
      >
        Host
      </button>
      <ul>{rooms}</ul>
    </>
  );
};

export { Hall };
