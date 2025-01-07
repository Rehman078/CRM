import { httpResponse } from "../index.js";
import Note from "../../models/Note/noteModel.js";

export const getNotesByRole = async (userId, role, res ) =>{
    try{
      if(role === "Admin" || role === "Manager"){
        const notes = await Note.find();
        return httpResponse.SUCCESS(res, notes, "All notes retrieved successfully"); 
      }
        else if(role === "SalesRep"){
            const notes = await Note.find({note_by: userId});
          return httpResponse.SUCCESS(res, notes, "All notes your retrieved successfully");
  
      }
      return httpResponse.FORBIDDEN(res, null, "You are not authorized to view notes");
    }
    catch(err){
        return httpResponse.BAD_REQUEST(res, err.message);
    }

}
