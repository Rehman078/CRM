import { httpResponse } from "../index.js";
import Note from "../../models/Note/noteModel.js";

export const deleteNotesByRole = async (noteId, userId, role, res) => {
  let note;

  if (role === "Admin" || role === "Manager") {
    note  = await Note.findByIdAndDelete(noteId);
    if (!note) {
      return httpResponse.NOT_FOUND(res, null, "note not found");
    }
    return httpResponse.SUCCESS(res, null, "note deleted successfully");
  }

  if (role === "SalesRep") {
    note = await Note.findById(noteId);
    if (!note) {
      return httpResponse.NOT_FOUND(res, null, "note not found");
    }

    if (note.note_by.toString() !== userId.toString()) {
      return httpResponse.UNAUTHORIZED(res, null, "You can only delete notes you created");
    }

    await Note.findByIdAndDelete(noteId);
    return httpResponse.SUCCESS(res, null, "note deleted successfully");
  }

  // Unauthorized roles
  return httpResponse.UNAUTHORIZED(res, null, "You are not authorized to delete this note");
};