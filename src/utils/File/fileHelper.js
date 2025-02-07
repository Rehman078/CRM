import LeadAsignment from "../../models/Lead/assignLeadModel.js";
import ContactAsignment from "../../models/Contact/assignContactModel.js"
import Lead from "../../models/Lead/leadModel.js"
import Contact from "../../models/Contact/contactModel.js";
import File from "../../models/File/fileModel.js";
import { httpResponse } from '../index.js';
import fs from "fs";
export const createdFileByRole = async (userId, role, source, source_id) => {
  try {
    let result = false;

    if (role === "Admin" || role === "Manager") {
      if (source === "Contact") {
        result = await Contact.findOne({ _id: source_id });
      } else if (source === "Lead") {
        result = await Lead.findOne({ _id: source_id });
      }
    } else if (role === "SalesRep") {
      if (source === "Contact") {
        const contactCreated = await Contact.findOne({ _id: source_id, created_by: userId });
        const contactAssigned = await ContactAsignment.findOne({ contact_id: source_id, salerep_id: userId });
        result = contactCreated || contactAssigned;
      } else if (source === "Lead") {
        const leadCreated = await Lead.findOne({ _id: source_id, created_by: userId });
        const leadAssigned = await LeadAsignment.findOne({ lead_id: source_id, salerep_id: userId });
        result = leadCreated || leadAssigned;
      }
    }
    return result;
  } catch (err) {
    throw err;
  }
};


export const fetchFilesByRole = async (source, source_id, role, userId) => {
    const populateFields = [
      { path: "uploaded_by", select: "name email role" },

    ];
  
    try {
      const query = { source, source_id };
  
      if (role === "Admin" || role === "Manager") {
        return await File.find(query).populate(populateFields);
      } else if (role === "SalesRep") {
        return await File.find(query).populate(populateFields);
      } else {
        throw new Error("Not authorized to view files");
      }
    } catch (err) {
      throw new Error(err.message);
    }
  };

export const updateFilesByRole = async (fileSourceId, updatedData, userId, role, res) => {
  try {

    let file;
 
    if (role === "Admin" || role === "Manager") {
      console.log(fileSourceId)
      // Find the file by ID
      file = await File.findOne({ source_id: fileSourceId });
      console.log(file)
      if (!file) {
        return httpResponse.NOT_FOUND(res, null, "File not found");
      }

      // Find and remove all files with the same source_id
      const existingFiles = await File.find({ source_id: fileSourceId });
      const existingFileIds = existingFiles.map(file => file._id);

      await File.deleteMany({ _id: { $in: existingFileIds } });
      existingFiles.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      const newFiles = await File.insertMany(updatedData);
      return httpResponse.SUCCESS(res, newFiles, "Files updated successfully");
    } else if (role === "SalesRep") {
      file = await File.findOne({ source_id: fileSourceId });
      if (!file) {
        return httpResponse.NOT_FOUND(res, null, "File not found");
      }

      if (file.uploaded_by.toString() !== userId.toString()) {
        return httpResponse.FORBIDDEN(res, null, "You can only update files you created");
      }
      const existingFiles = await File.find({ source_id: fileSourceId });
      const existingFileIds = existingFiles.map(file => file._id);

      await File.deleteMany({ _id: { $in: existingFileIds } });

      // Delete physical files
      existingFiles.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      // Insert new files
      const newFiles = await File.insertMany(updatedData);
      return httpResponse.SUCCESS(res, newFiles, "Files updated successfully");
    } else {
      return httpResponse.UNAUTHORIZED(res, null, "Not authorized to update files");
    }
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

export const deleteFilesByRole = async (fileSourceId, userId, role, res) => {
  
    let files;
    try{
        if (role === 'Admin' || role === 'Manager') {
            files = await File.find({ source_id: fileSourceId });
    
            if (files.length === 0) {
                return httpResponse.NOT_FOUND(res, null, 'Files not found');
              }
              await File.deleteMany({ source_id: fileSourceId });
              files.forEach(file => {
                if (fs.existsSync(file.path)) {
                  fs.unlinkSync(file.path);
                }
                
              });
              return httpResponse.SUCCESS(res, null, 'Files deleted successfully');
    
    
    }
    if (role === 'SalesRep') {
        files = await File.find({ source_id: fileSourceId, uploaded_by: userId });
        if (files.length === 0) {
          return httpResponse.NOT_FOUND(res, null, 'No files found for this source or not authorized');
        }
    
        // Delete files from DB
        await File.deleteMany({ source_id: fileSourceId, uploaded_by: userId });
    
        // Delete physical files
        files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
    
        return httpResponse.SUCCESS(res, null, 'Your files were deleted successfully');
      }
      return httpResponse.UNAUTHORIZED(res, null, 'You are not authorized to delete these files');

    }catch(err){
        return httpResponse.BAD_REQUEST(res, err.message);
    }
    

}