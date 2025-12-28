import mongoose from "mongoose";
const NoteSchema = new mongoose.Schema({
    title: {
        type:String,
        required:true,
    },
    description: {
        type:String,
        required:true,
    },
    audio: {
        type: String, // store URL or file path
        required: false,
    },
    image: {
        type: String, // store URL or file path
        required: false,
    },
      createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
   
}, {timestamps:true});
const Note=mongoose.model("Notes",NoteSchema);
export default Note;