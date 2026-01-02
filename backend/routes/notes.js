import express from "express";
import Note from "../Models/Note.js";
import { protect } from "../middleware/auth.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const router = express.Router();
// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result.secure_url);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// GET all notes
router.get("/", protect, async (req, res) => {
  try {
    const notes = await Note.find({ createdBy: req.user._id });
    res.json(notes);
  } catch (err) {
    console.error("Get all notes error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE NOTE
router.post(
  "/",
  protect,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, description, date } = req.body;
      if (!title || !description) {
        return res.status(400).json({ message: "Please fill all fields" });
      }

      let imageUrl = "";
      let audioUrl = "";

      // Upload image
      if (req.files?.image?.[0]?.buffer) {
        imageUrl = await uploadToCloudinary(req.files.image[0].buffer, {
          folder: "notes_app",
        });
      }

      // Upload audio
      if (req.files?.audio?.[0]?.buffer) {
        audioUrl = await uploadToCloudinary(req.files.audio[0].buffer, {
          folder: "notes_app",
          resource_type: "video",
        });
      }

      const note = await Note.create({
        title,
        description,
        date: date ? new Date(date) : null,
        image: imageUrl,
        audio: audioUrl,
        createdBy: req.user._id,
      });

      res.status(201).json(note);
    } catch (err) {
      console.error("Create note error:", err);
      res.status(500).json({ message: "Server error: " + err.message });
    }
  }
);

// GET single note
router.get("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (err) {
    console.error("Get note error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE NOTE
router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, description, date } = req.body;
      const note = await Note.findById(req.params.id);
      if (!note) return res.status(404).json({ message: "Note not found" });

      if (note.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized" });
      }
      // Upload new image if provided
      if (req.files?.image?.[0]?.buffer) {
        note.image = await uploadToCloudinary(req.files.image[0].buffer, {
          folder: "notes_app",
        });
      }

      // Upload new audio if provided
      if (req.files?.audio?.[0]?.buffer) {
        note.audio = await uploadToCloudinary(req.files.audio[0].buffer, {
          folder: "notes_app",
          resource_type: "video",
        });
      }

      // Update text and date
      note.title = title || note.title;
      note.description = description || note.description;
      if (date) note.date = new Date(date);

      const updatedNote = await note.save();
      res.json(updatedNote);
    } catch (err) {
      console.error("Update note error:", err);
      res.status(500).json({ message: "Server error: " + err.message });
    }
  }
);

// DELETE NOTE
router.delete("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await note.deleteOne();
    res.json({ message: "Note was deleted" });
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
