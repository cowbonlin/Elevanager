import React from 'react';
import socketio from "socket.io-client";

// ref: https://dev.to/bravemaster619/how-to-use-socket-io-client-correctly-in-react-app-o65
export const socket = socketio.connect('http://localhost:3001');
export const SocketContext = React.createContext();