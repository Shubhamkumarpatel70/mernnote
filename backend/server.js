import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js'
import notesRoutes from './routes/notes.js'
dotenv.config();
const app =express();
const PORT = process.env.PORT || 6000;
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/users", authRoutes);
app.use("/api/notes", notesRoutes);
connectDB();
app.listen(PORT, ()=>{
    console.log(`server is running on ${PORT}`)
})