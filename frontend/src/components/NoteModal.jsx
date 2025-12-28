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
  useEffect(() => {
    setTitle(note ? note.title : "");
    setDescription(note ? note.description : "");
    setImage(null);
    setAudio(null);
    setDate(note ? note.date?.slice(0,10) : ""); // assuming note.date is ISO string
    setTime(note ? note.date?.slice(11,16) : "");
    setError("");
  }, [note]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (image) formData.append("image", image);
      if (audio) formData.append("audio", audio);
      if (date && time) formData.append("date", new Date(`${date}T${time}`));

      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      };

      let data;
      if (note) {
        const response = await axios.put(`/api/notes/${note._id}`, formData, config);
        data = response.data;
      } else {
        const response = await axios.post("/api/notes", formData, config);
        data = response.data;
      }

      onSave(data);
      setTitle("");
      setDescription("");
      setImage(null);
      setAudio(null);
      setDate("");
      setTime("");
      setError("");
      onClose();
    } catch (err) {
      console.error("Note save error:", err);
      setError("Failed to save note");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold text-white mb-4">
          {note ? "Edit Note" : "Create Note"}
        </h2>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Note Description"
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            required
          />
          <div>
            <label className="text-white mb-1 block">Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="text-white"
            />
          </div>
          <div>
            <label className="text-white mb-1 block">Audio:</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setAudio(e.target.files[0])}
              className="text-white"
            />
          </div>
          <div className="flex space-x-2">
            <div>
              <label className="text-white mb-1 block">Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-2 py-1 rounded-md"
              />
            </div>
          </div>
          <div className="flex space-x-2 mt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {note ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
