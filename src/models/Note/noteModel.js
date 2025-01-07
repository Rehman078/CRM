import mongoose from "mongoose";
const noteSchema = new mongoose.Schema(
    {
        note: { type: String, required: true,  },
        note_type: { type: String, enum: ["Contact", "Lead", "Activity"], required: true },
        note_to: { type: mongoose.Schema.Types.ObjectId, required: true },
        note_by: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    },
    { timestamps: true }
)
const Note = mongoose.model("Note", noteSchema);
export default Note