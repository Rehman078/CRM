import File from '../../models/File/fileModel.js';
import { createdFileByRole, fetchFilesByRole, updateFilesByRole, deleteFilesByRole } from '../../utils/File/fileHelper.js';
import { httpResponse } from "../../utils/index.js";
import fs from 'fs';
import path from 'path';

const createFile = async (req, res) => {
  try {
    const { source, source_id } = req.body;
    const { role: userRole, _id: userId } = req.user;
    
    // Check if files are uploaded
    if (!req.files || req.files.length === 0) {
      return httpResponse.BAD_REQUEST(res, null, "Files are required");
    }

    // Check if the user is authorized to upload files for the specified source
    const isAuthorized = await createdFileByRole(userId, userRole, source, source_id);
    if (!isAuthorized) {
      return httpResponse.FORBIDDEN(res, null, "You are not authorized to upload files for this Lead/Contact.");
    }

    // Map through the uploaded files to store their details
    const files = req.files.map((file) => {
      const normalizedPath = file.path.replace(/\\/g, '/'); // Normalize file path

      return {
        original_name: file.originalname,
        current_name: file.filename,
        type: file.mimetype,
        path: normalizedPath,
        size: file.size,
        source,
        source_id,
        uploaded_by: userId,
        link: `${req.protocol}://${req.get("host")}/${normalizedPath}`, // Construct link with normalized path
      };
    });

    // Insert file details into the database
    const createdFiles = await File.insertMany(files);
    
    // Return success response with the created files
    return httpResponse.SUCCESS(res, createdFiles, "Files created successfully");
  } catch (err) {
    // Return error if something goes wrong
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};



const getAllFiles = async (req, res) => {
  try {
    const { source, source_id } = req.query;
    const { role, _id: userId } = req.user;

    // Validate source and source_id
    if (!source || !source_id) {
      return httpResponse.BAD_REQUEST(res, "Source and Source ID are required");
    }

    const files = await fetchFilesByRole(source, source_id, role, userId);

    return httpResponse.SUCCESS(res, files, "Files retrieved successfully");
  } catch (err) {
    if (err.message === "Not authorized to view files") {
      return httpResponse.UNAUTHORIZED(res, null, err.message);
    }
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

//get files by source id
const getFilesBySourceId = async (req, res) => {
  try {
    const { id } = req.params;
    const files = await File.find({ source_id: id });
    if (files.length === 0) {
      return httpResponse.NOT_FOUND(res, null, 'Files not found');
    }
    return httpResponse.SUCCESS(res, files, 'Files retrieved successfully');
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err);
  }
};

//update files
const updateFile = async (req, res) => {
  try{
    const {id}=req.params;
  const { role, _id: userId } = req.user;
    const { source_id, source,} = req.body;
    const filesData = req.files.map((file) => ({
      original_name: file.originalname,
      current_name: file.filename,
      type: file.mimetype,
      path: file.path,
      size: file.size,
      source_id,
      source,
      uploaded_by:userId 
    }));
  
  await updateFilesByRole(id, filesData, userId, role, res);
  }
  catch(err){
    return httpResponse.BAD_REQUEST(res, err.message);
  }
}

// DELETE files
const deleteFiles = async (req, res) => {
  try{
   const { id } = req.params; 
    const { role, _id: userId } = req.user; 
    await deleteFilesByRole(id, userId, role, res);
  }catch(err){
    return httpResponse.BAD_REQUEST(res, err.message);
  }
}
const deleteByFileId = async (req, res) => {
  try {
    const { id } = req.params; 

    const file = await File.findById(id);
    if (!file) {
      return httpResponse.NOT_FOUND(res, null, "File not found")
    }

     if (fs.existsSync(file.path)) {
               fs.unlinkSync(file.path);
             }
    await File.findByIdAndDelete(id);
    return httpResponse.SUCCESS(res, null, "File deleted successfully")
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};
export default {
  createFile,
  getAllFiles,
  updateFile,
  deleteFiles,
  getFilesBySourceId,
  deleteByFileId
}