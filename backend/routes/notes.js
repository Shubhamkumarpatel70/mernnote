import express from "express";
import Note from "../Models/Note.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs"
const router = express.Router();

// Get all notes
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

      if (req.files?.image) {
        const img = await cloudinary.uploader.upload(req.files.image[0].path);
        imageUrl = img.secure_url;
        fs.unlinkSync(req.files.image[0].path); // remove temp file
      }

      if (req.files?.audio) {
        const aud = await cloudinary.uploader.upload(req.files.audio[0].path, {
          resource_type: "video",
        });
        audioUrl = aud.secure_url;
        fs.unlinkSync(req.files.audio[0].path); // remove temp file
      }

      const note = await Note.create({
        title,
        description,
        date: date ? new Date(date) : null, // parse ISO string to Date
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

// Get a single note
router.get("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json(note);
  } catch (err) {
    console.error("Get note error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a note
// Update a note
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

      // Update files
      if (req.files?.image) {
        const img = await cloudinary.uploader.upload(req.files.image[0].path);
        note.image = img.secure_url;
        fs.unlinkSync(req.files.image[0].path);
      }

      if (req.files?.audio) {
        const aud = await cloudinary.uploader.upload(req.files.audio[0].path, {
          resource_type: "video",
        });
        note.audio = aud.secure_url;
        fs.unlinkSync(req.files.audio[0].path);
      }

      // Update text/date
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

// Delete a note
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
