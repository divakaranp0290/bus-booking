import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aggregatorRoutes from './routes/aggregator.routes';
import bookingRoutes from './routes/booking.routes';
import { startBlockReleaser } from './utils/blockReleaser';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/aggregator', aggregatorRoutes);
app.use('/api/booking', bookingRoutes);

app.get('/', (_, res) => res.send('BIT1 backend running (Postgres)'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on ${PORT}`);
  startBlockReleaser(); // start TTL releaser
});
