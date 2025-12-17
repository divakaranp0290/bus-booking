// backend/src/sockets/index.ts
import { Server as IOServer, Socket } from 'socket.io';
import http from 'http';

let ioInstance: IOServer | null = null;

export function initSocketServer(httpServer: http.Server) {
  if (ioInstance) return ioInstance;
  const io = new IOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: any) => {
    // join room for a bus
    socket.on('join:bus', (busId: string) => {
      if (!busId) return;
      socket.join(`bus:${busId}`);
    });

    socket.on('leave:bus', (busId: string) => {
      if (!busId) return;
      socket.leave(`bus:${busId}`);
    });

    socket.on('disconnect', () => {
      // noop for now
    });
  });

  ioInstance = io;
  return io;
}

export function getIO() {
  if (!ioInstance) throw new Error('Socket.io not initialized. Call initSocketServer(httpServer) first.');
  return ioInstance;
}
