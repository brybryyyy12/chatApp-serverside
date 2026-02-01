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

// CORS setup
app.use(cors({
  origin: "https://chat-app-clientside.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // allow OPTIONS
  allowedHeaders: ["Content-Type", "Authorization"],     // allow headers your frontend sends
}));

// Handle preflight requests manually (important on some platforms)
app.options("*", cors({
  origin: "https://chat-app-clientside.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// create server
const server = http.createServer(app);

// setup socket.io
const io = new Server(server, {
  cors: { origin: "https://chat-app-clientside.vercel.app" },

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
