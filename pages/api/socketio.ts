import { Server as SocketIOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import { setIO } from "@/lib/socket-server";

interface SocketServer extends HTTPServer {
  io?: SocketIOServer;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const socketServer = (res.socket as unknown as SocketWithIO)?.server;

  if (socketServer?.io) {
    // Already initialized on HTTP server, but ensure globalThis ref is set
    // (module scope can reset on hot reload while HTTP server persists)
    setIO(socketServer.io);
    res.end();
    return;
  }

  const io = new SocketIOServer(socketServer, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  socketServer.io = io;
  setIO(io);

  io.on("connection", (socket) => {
    socket.on("join-user", (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on("join-monitor", () => {
      socket.join("monitor-dashboard");
    });

    socket.on("leave-monitor", () => {
      socket.leave("monitor-dashboard");
    });

    socket.on("disconnect", () => {
      // cleanup handled automatically by socket.io
    });
  });

  res.end();
}
