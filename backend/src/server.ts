// backend/src/server.ts (partial snippet)
import express from 'express';
import http from 'http';
import { initSocketServer } from './sockets';
import bookingRouter from './routes/booking';
// ... your existing imports & app setup

const app = express();
// ... bodyParser, routes, middleware, etc.

// Create HTTP server & init Socket.IO
const httpServer = http.createServer(app);
const io = initSocketServer(httpServer);

// optionally make io available via app (controllers can use req.app.get('io') or getIO())
app.set('io', io);
app.use('/api/booking', bookingRouter);
// start
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Backend listening on ${PORT}`);
});
