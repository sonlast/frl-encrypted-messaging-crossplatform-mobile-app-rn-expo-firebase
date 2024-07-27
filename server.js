const express = require('express');
const { createServer } = require('http');
const socketIo = require('socket.io');

const app = express();
const server = createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('offer', (offer) => {
    socket.broadcast.emit('offer', offer);
  });

  socket.on('answer', (answer) => {
    socket.broadcast.emit('answer', answer);
  });

  socket.on('ice-candidate', (candidate) => {
    socket.broadcast.emit('ice-candidate', candidate);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Signaling server running on port 3000');
});
