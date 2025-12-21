import express from 'express';
import locationRoutes from './modules/location/location.routes';
import searchRoutes from './modules/search/search.routes';

const app = express();
app.use(express.json());

app.use('/api', locationRoutes);
app.use('/api', searchRoutes);


export default app;
