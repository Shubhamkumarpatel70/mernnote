import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import summarizeRoute from './routes/summarize.js';

const __dirname = path.resolve();
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 6000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? "*" : "http://localhost:5173",
  credentials: true
}));

// Routes
app.use("/api/users", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/summarize", summarizeRoute);

// Connect DB
connectDB();

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
