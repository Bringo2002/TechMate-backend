import express from 'express';
import cors from 'cors';
import requestRoutes from './routes/requestRoutes';
import authRoutes from "./routes/authRoutes";
import generalLimiter from "./middleware/rateLimiter";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Apply general rate limiting to all routes

app.use(generalLimiter);

// Auth routes
app.use('/api/auth', authRoutes);

app.use('/api/requests', requestRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
