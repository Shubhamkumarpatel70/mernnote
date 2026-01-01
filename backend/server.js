import dotenv from 'dotenv';
dotenv.config({ path: path.resolve('backend/.env') });
import express from 'express';
import cors from 'cors'
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js'
import notesRoutes from './routes/notes.js'
import summarizeRoute from "./routes/summarize.js";
import path from 'path'
const app =express();
const PORT = process.env.PORT || 6000;
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/users", authRoutes);
app.use("/api/notes", notesRoutes);

app.use("/api/summarize", summarizeRoute);
const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}
connectDB();
app.listen(PORT, ()=>{
    console.log(`server is running on ${PORT}`)
})