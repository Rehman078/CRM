import mongoose from "mongoose";
import LeadAsignment from "../../models/Lead/assignLeadModel.js";
import ContactAsignment from "../../models/Contact/assignContactModel.js"
import Lead from "../../models/Lead/leadModel.js"
import Contact from "../../models/Contact/contactModel.js";
import Note from "../../models/Note/noteModel.js";
import { httpResponse } from "../index.js";

export const createdNoteByRole = async (userId, role, note_to, note_type) => {
    try {
      let result = false;
  
      if (role === "Admin" || role === "Manager") {
        if (note_type === "Contact") {
          result = await Contact.findOne({ _id: note_to });
        } else if (note_type === "Lead") {
          result = await Lead.findOne({ _id: note_to });
        }
      } else if (role === "SalesRep") {
        if (note_type === "Contact") {
          const contactCreated = await Contact.findOne({ _id: note_to, created_by: userId });
          const contactAssigned = await ContactAsignment.findOne({ contact_id: note_to, salerep_id: userId });
          result = contactCreated || contactAssigned;
        } else if (note_type === "Lead") {
          const leadCreated = await Lead.findOne({ _id: note_to, created_by: userId });
          const leadAssigned = await LeadAsignment.findOne({ lead_id: note_to, salerep_id: userId });
          result = leadCreated || leadAssigned;
        }
      }
      return result;
    } catch (err) {
      throw err;
    }
  };

  export const fetchNoteByRole = async (note_type, note_to, role, userId) => {
    const populateFields = [
      { path: "created_by", select: "name email role" },

    ];
  
    try {
      const query = { note_type, note_to };
  
      if (role === "Admin" || role === "Manager") {
        return await Note.find(query).populate(populateFields);
      } else if (role === "SalesRep") {
        return await Note.find(query).populate(populateFields);
      } else {
        throw new Error("Not authorized to view files");
      }
    } catch (err) {
      throw new Error(err.message);
    }

    // try {
    //     const pipeline = [
    //         {
    //             $match: { note_type, note_to: new mongoose.Types.ObjectId(note_to) },
    //         },
    //         {
    //             $lookup: {
    //                 from: "users", 
    //                 localField: "created_by",
    //                 foreignField: "_id",
    //                 as: "created_by",
    //             },
    //         },
    //         {
    //             $lookup: {
    //                 from: "contacts", 
    //                 localField: "note_to",
    //                 foreignField: "_id",
    //                 as: "note_to",
    //             },
    //         },
    //         {
    //             $unwind: { path: "$created_by", preserveNullAndEmptyArrays: true },
    //         },
    //         {
    //             $unwind: { path: "$note_to", preserveNullAndEmptyArrays: true },
    //         },
    //         {
    //             $project: {
    //                 _id: 1, 
    //                 note_type: 1,
    //                 note: 1, 
    //                 note_detail: {
    //                      id:"$note_to._id",
    //                     name: "$note_to.name", 
    //                     email: "$note_to.email"
    //                 },
    //                 created_by: {
    //                     name: "$created_by.name", 
    //                     email: "$created_by.email", 
    //                 },
    //             },
    //         },
    //     ];

    //     if (role === "SalesRep") {
    //         pipeline.unshift({
    //             $match: {
    //                 created_by: new mongoose.Types.ObjectId(userId),
    //             },
    //         });
    //     }

    //     const notes = await Note.aggregate(pipeline);
    //     return notes;
    // } catch (err) {
    //     throw new Error(err.message);
    // }
};

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
   
         if (note.created_by.toString() !== userId.toString()) {
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

    if (note.created_by.toString() !== userId.toString()) {
      return httpResponse.UNAUTHORIZED(res, null, "You can only delete notes you created");
    }

    await Note.findByIdAndDelete(noteId);
    return httpResponse.SUCCESS(res, null, "note deleted successfully");
  }

  // Unauthorized roles
  return httpResponse.UNAUTHORIZED(res, null, "You are not authorized to delete this note");
};
