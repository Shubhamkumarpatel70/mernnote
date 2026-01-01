import React, { useEffect, useState } from "react";
import axios from "axios";

const NoteModal = ({ isOpen, onClose, note, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [date, setDate] = useState(""); 
  const [time, setTime] = useState(""); 
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    setTitle(note?.title || "");
    setDescription(note?.description || "");
    setImage(null);
    setAudio(null);
    setDate(note?.date?.slice(0,10) || "");
    setTime(note?.date?.slice(11,16) || "");
    setError("");
    setSummary("");
  }, [note]);

const handleSummarize = async () => {
  if (!description.trim()) return;
  setLoadingSummary(true);

  try {
    const response = await axios.post(
      "http://localhost:1000/api/summarize",
      { text: description }
    );

    const { summary: result, source } = response.data;
    setSummary(result);

    if (source === "genai") {
      // Auto-replace description only if GenAI produced it
      setDescription(result);
    }

    console.log("Summary source:", source); // genai or fallback
  } catch (err) {
    console.error("Summarize error:", err);
    setSummary("Failed to summarize");
  } finally {
    setLoadingSummary(false);
  }
};




 const handleSubmit = async (e) => {
  e.preventDefault();
  setError(""); // clear previous errors

  try {
    const token = localStorage.getItem("token");
    if (!token) return setError("No authentication token found.");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    if (image) formData.append("image", image);
    if (audio) formData.append("audio", audio);

    if (date) {
      const finalDate = time ? new Date(`${date}T${time}`) : new Date(date);
      formData.append("date", finalDate.toISOString()); // send as ISO string
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    let data;
    if (note) {
      // Update note
      data = (await axios.put(
        `http://localhost:1000/api/notes/${note._id}`,
        formData,
        config
      )).data;
    } else {
      // Create note
      data = (await axios.post(
        "http://localhost:1000/api/notes",
        formData,
        config
      )).data;
    }

    onSave(data);
    // Reset form
    setTitle("");
    setDescription("");
    setImage(null);
    setAudio(null);
    setDate("");
    setTime("");
    setSummary("");
    onClose();

  } catch (err) {
    console.error("Note save error:", err);
    setError(err.response?.data?.message || err.message || "Failed to save note");
  }
};


  if (!isOpen) return null;

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="w-full max-w-lg rounded-2xl bg-gray-900 shadow-2xl border border-gray-700">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">
          {note ? "Edit Note" : "Create Note"}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xl"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 p-2 rounded-md">
            {error}
          </p>
        )}

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write your note..."
          rows={4}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Summarize Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSummarize}
            disabled={loadingSummary}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loadingSummary ? "Summarizing..." : "✨ Summarize"}
          </button>
        </div>

        {/* Summary */}
        {summary && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-white">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-green-400">AI Summary</span>
              <button
                type="button"
                onClick={() => setDescription(summary)}
                className="text-xs text-yellow-400 hover:underline"
              >
                Replace
              </button>
            </div>
            <p className="text-gray-200">{summary}</p>
          </div>
        )}

        {/* Attachments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-400">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="mt-1 w-full text-sm text-gray-300"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Audio</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setAudio(e.target.files[0])}
              className="mt-1 w-full text-sm text-gray-300"
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="text-sm text-gray-400">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {note ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

};

export default NoteModal;
