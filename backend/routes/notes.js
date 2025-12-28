import express from "express";
import Note from "../Models/Note.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

// Get notes
router.get("/", protect, async (req, res) => {
  try {
    const notes = await Note.find({ createdBy: req.user._id });
    res.json(notes);
  } catch (err) {
    console.error("Get all notes error: ", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Create a note
router.post(
  "/",
  protect,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    const { title, description } = req.body;

    try {
      if (!title || !description) {
        return res.status(400).json({ message: "Please fill all the fields" });
      }
      let imageUrl = "";
      let audioUrl = "";
      if (req.files?.image) {
        const img = await cloudinary.uploader.upload(
          req.files.image[0].path
        );
        imageUrl = img.secure_url;
      }
      if (req.files?.audio) {
        const aud = await cloudinary.uploader.upload(
          req.files.audio[0].path,
          { resource_type: "video" } // audio/video
        );
        audioUrl = aud.secure_url;
      }
      const note = await Note.create({
        title,
        description,
        image: imageUrl,
        audio: audioUrl,
        createdBy: req.user._id,
      });
       try {
  await sendEmail({
    to: req.user.email,
    subject: "New Note Created 📝",
    text: `Hi ${req.user.username},
Your note "${title}" has been created successfully.`,
  });
} catch (emailErr) {
  console.error("Email failed but note created", emailErr);
}
      res.status(201).json(note);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);
// Get a note
router.get("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update a note
router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    const { title, description } = req.body;

    try {
      const note = await Note.findById(req.params.id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      if (note.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized" });
      }

      if (req.files?.image) {
        const img = await cloudinary.uploader.upload(
          req.files.image[0].path
        );
        note.image = img.secure_url;
      }

      if (req.files?.audio) {
        const aud = await cloudinary.uploader.upload(
          req.files.audio[0].path,
          { resource_type: "video" }
        );
        note.audio = aud.secure_url;
      }

      note.title = title || note.title;
      note.description = description || note.description;

      const updatedNote = await note.save();
      res.json(updatedNote);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);


// Delete a note
router.delete("/:id", protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: " You are Not Authorized" });
    }
    await note.deleteOne();
    res.json({ message: "Note was deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


export default router;