import express from 'express';
import cors from 'cors';
import requestRoutes from './routes/requestRoutes';
import authRoutes from "./routes/authRoutes";
import generalLimiter from "./middleware/rateLimiter";
import messageRoute from './routes/messageRoutes';
import profileRoutes from './routes/profileRoutes';
import dashboardRoutes from "./routes/dashboardRoutes"


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Apply general rate limiting to all routes

app.use(generalLimiter);

// Auth routes
app.use('/api/auth', authRoutes);


// Request routes
app.use('/api/requests', requestRoutes);

// Message routes
app.use('/api/messages', messageRoute);

// Profile routes
app.use('/api/profile', profileRoutes);

// Static file serving for uploads
app.use("/uploads", express.static("uploads"));

// Dashboard routes
app.use("/api/dashboard", dashboardRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
