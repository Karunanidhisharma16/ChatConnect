import { io } from 'socket.io-client';

// const SOCKET_URL = 'http://localhost:5000';
const SOCKET_URL = 'https://chatconnect-2siz.onrender.com';
export const socket = io(SOCKET_URL, {
  autoConnect: false
});

export const connectSocket = (userId) => {
  socket.connect();
  socket.emit('user-online', userId);
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export const sendMessage = (senderId, receiverId, content) => {
  socket.emit('send-message', { senderId, receiverId, content });
};