import express from "express";
import { createServer } from "http";
import { Server } from "colyseus";
import { MyRoom } from "./rooms/MyRoom";

const app = express();
app.use(express.json());

app.get("/health", async (req, res) => {
  console.log("Health check requested from:", req.ip);
  return res
    .status(200)
    .json({ status: "healthy", timestamp: new Date().toISOString() });
});

const PORT = parseInt(process.env.port || "2567");
const HOSTNAME = process.env.HOSTNAME || "localhost";

const gameServer = new Server({
  server: createServer(app),
  // driver: new RedisDriver(),
  // presence: new RedisPresence(),
});

/**
 * Define your room handlers:
 */
gameServer.define("my_room", MyRoom);
gameServer.listen(PORT, HOSTNAME).then(() => {
  console.log(`Server started, listening on ${HOSTNAME}:${PORT}`);
});
