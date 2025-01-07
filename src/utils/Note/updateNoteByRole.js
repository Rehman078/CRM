import {httpResponse} from '../index.js';
import Note from '../../models/Note/noteModel.js';

export const updateNoteByRole = async (noteId, updatedData, userId, role, res) => {
     let note;
      
          if (role === "Admin" || role === "Manager") {
            note= await Note.findByIdAndUpdate(noteId, updatedData, {
              new: true,
              runValidators: true,
            });
            if (!note) {
              return httpResponse.NOT_FOUND(res, null, "note not found");
            }
            return httpResponse.SUCCESS(res, note, "note updated successfully");
          }
      
          if (role === "SalesRep") {
            note = await Note.findById(noteId);
            if (!note) {
              return httpResponse.NOT_FOUND(res, null, "note not found");
            }
      
            if (note.note_by.toString() !== userId.toString()) {
              return httpResponse.FORBIDDEN(res, null, "You can only update notes you created");
            }
      
            note = await Note.findByIdAndUpdate(noteId, updatedData, {
              new: true,
              runValidators: true,
            });
            return httpResponse.SUCCESS(res, note, "note updated successfully");
          }
      
          return httpResponse.FORBIDDEN(res, null, "You are not authorized to update this note");
}