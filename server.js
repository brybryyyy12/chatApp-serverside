import express from 'express';
import cors from 'cors';
import "dotenv/config";
import http from 'http';
import { Server } from 'socket.io';

import conn from './src/config/conn.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import chatRoutes from './src/routes/chat.routes.js';

conn(); // database connection

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// create server
const server = http.createServer(app);

// setup socket.io
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

// attach io to app so controllers can access it
app.set("io", io);

// socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(socket.id, "joined", conversationId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
