import Note from "../../models/Note/noteModel.js";
import { httpResponse } from "../../utils/index.js";
import { validateNote } from "../../validations/noteValidation.js";
import { createdNoteByRole, fetchNoteByRole, updateNoteByRole, deleteNotesByRole } from "../../utils/Note/noteHelper.js";
//create note
const createNote = async (req, res) => {
    try{
        const { note, note_type, note_to } = req.body;
        const { _id:userId, role } = req.user
        const { error } = validateNote(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        const isAuthorized = await createdNoteByRole(userId, role, note_to, note_type);
            if (!isAuthorized) {
              return httpResponse.FORBIDDEN(res, null, "You are not authorized to upload note for this Lead/Contact.");
            }
        const noteInfo = new Note({
            note,
            note_type,
            note_to,
            created_by: userId
        });
        await noteInfo.save();
        return httpResponse.SUCCESS(res, noteInfo, "Note created successfully");
    }catch(err){
        return httpResponse.BAD_REQUEST(res, err.message);
    }
}

//get all notes
const getNotes = async (req, res) => {
    try {
        const { role, _id } = req.user;
        const { note_to, note_type } = req.query;
        const notes = await fetchNoteByRole(note_type, note_to, role, _id);
        
        return httpResponse.SUCCESS(res, notes); 
    } catch (err) {
        return httpResponse.BAD_REQUEST(res, err.message);
    }
}

//update note
const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, _id } = req.user;
        const { note, note_type, note_to } = req.body; 
        const { error } = validateNote(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        const updatedData = {
            note,
            note_type,
            note_to,
        };

        return await updateNoteByRole(id, updatedData, _id, role, res);
    } catch (err) {
        return httpResponse.BAD_REQUEST(res, err.message);
    }
};

//delete note
const deleteNote = async(req, res) => {
    try{
        const { id } = req.params;
        const { role, _id } = req.user;

        return await deleteNotesByRole(id, _id, role, res);
    }
    catch(err){
        return httpResponse.BAD_REQUEST(res, err.message);
}
}
export default {
    createNote,
    getNotes,
    deleteNote,
    updateNote
}