import React, { useContext, useState } from "react";
import { SocketContext } from "./context/socket";

const Panel = () => {
  const [fromFloor, setFromFloor] = useState(7);
  const [toFloor, setToFloor] = useState(1);
  const socket = useContext(SocketContext);
  
  const moveBtnClick = (eId, newFloor) => {
    socket.emit('moveElevator', eId, newFloor);
  };
  
  const createPassenger = () => {
    const fromFloorInt = +fromFloor;
    const toFloorInt = +toFloor;
    if (isNaN(fromFloorInt) || isNaN(toFloorInt) || fromFloorInt < 1 || fromFloorInt > 7 || toFloorInt < 1 || toFloorInt > 7) {
      console.warn('invalid input', fromFloorInt, toFloorInt);
      return;
    }
    socket.emit('createPassenger', fromFloorInt, toFloorInt);
  };
  
  return (
    <div className="panel">
      <button onClick={() => moveBtnClick(0, 7)}>7</button>
      <button onClick={() => moveBtnClick(0, 6)}>6</button>
      <button onClick={() => moveBtnClick(0, 5)}>5</button>
      <button onClick={() => moveBtnClick(0, 4)}>4</button>
      <button onClick={() => moveBtnClick(0, 3)}>3</button>
      <button onClick={() => moveBtnClick(0, 2)}>2</button>
      <button onClick={() => moveBtnClick(0, 1)}>1</button>
      <hr />
      <button onClick={() => moveBtnClick(1, 7)}>7</button>
      <button onClick={() => moveBtnClick(1, 6)}>6</button>
      <button onClick={() => moveBtnClick(1, 5)}>5</button>
      <button onClick={() => moveBtnClick(1, 4)}>4</button>
      <button onClick={() => moveBtnClick(1, 3)}>3</button>
      <button onClick={() => moveBtnClick(1, 2)}>2</button>
      <button onClick={() => moveBtnClick(1, 1)}>1</button>
      <hr />
      <input type="text" value={fromFloor} onChange={(e) => setFromFloor(e.target.value)} />
      <input type="text" value={toFloor} onChange={(e) => setToFloor(e.target.value)} />
      <button onClick={createPassenger}>Create Passenger</button>
    </div>
  );
};

export default Panel;