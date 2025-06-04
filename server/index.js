import express from "express";
import logger from "morgan";
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

import { Server } from "socket.io";
import { createServer } from "node:http";

dotenv.config();
const port = process.env.PORT || 3000;

const app = express();
const server = createServer(app);
const io = new Server(server,{
    connectionStateRecovery: {}
});

const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_AUTH_TOKEN,
})

await db.execute(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT
  )
`);

app.use(express.json());

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  })

  socket.on("chat message", (msg) => {
    //* Broadcast: emitir un mensaje a todos los clientes conectados
    io.emit("chat message", msg); 
  })
})

app.use(logger("dev"));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/client/index.html");
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`); 
})