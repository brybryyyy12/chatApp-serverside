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
const allowedOrigins = [
  "http://localhost:5173",
  "https://chat-app-clientside.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // allow REST tools / same-origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
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
  cors: { 
    origin: [ "http://localhost:5173","https://chat-app-clientside.vercel.app"],
    methods: ["GET","POST","PUT"],
    credentials: true 

  },
  transports: ["websocket"]
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
