import File from '../../models/File/fileModel.js';
import { fetchFilesByRole } from '../../utils/File/fetchFilesByRole.js';
import { httpResponse } from "../../utils/index.js";
import { deleteFilesByRole } from '../../utils/File/deleteFileByRole.js';
import { updateFilesByRole } from '../../utils//File/updateFileByRole.js';
import fs from 'fs';

const createFile = async (req, res) => {
  try {

    const {source, source_id} = req.body;
    if (!source || !source_id ) {
      return httpResponse.BAD_REQUEST(res, null, 'Source, source_id, and uploaded_by are required');
    }
    if (!req.files || req.files.length === 0) {
      return httpResponse.BAD_REQUEST(res, null, 'Files are required');
    }

    // Validate source
    const validSources = ["Contact", "Lead", "Activity"];
    if (!validSources.includes(source)) {
      return httpResponse.BAD_REQUEST(res, null, ' source type not valid');
    }
    
    // Prepare file data
    const files = req.files.map((file) => ({
      original_name: file.originalname,
      current_name: file.filename,
      type: file.mimetype,
      path: file.path,
      size: file.size,
      source,
      source_id,
      uploaded_by:req.user._id,
      
    }));
    const createdFiles = await File.insertMany(files);
    return httpResponse.SUCCESS(res, createdFiles, "Files Created Successfully");
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err);
  }
};

// READ files on base of role
const getAllFiles = async (req, res) => {
  try {
    const { role, _id: userId } = req.user; 
    const files = await fetchFilesByRole(role, userId);

    return httpResponse.SUCCESS(res, files, "Files retrieved successfully");
  } catch (err) {
    if (err.message === "Not authorized to view files") {
      return httpResponse.FORBIDDEN(res, null, err.message);
    }
    return httpResponse.BAD_REQUEST(res, err, "Failed to retrieve files");
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
const updateFileP = async (req, res) => {
  try {
    const { source_id, source, note, created_by, } = req.body;

    if (!req.files || req.files.length === 0) {
      return httpResponse.BAD_REQUEST(res, null, 'Files are required');
    }
     // Validate source
     const validSources = ["Contact", "Lead", "Activity"];
     if (!validSources.includes(source)) {
       return httpResponse.BAD_REQUEST(res, null, ' source type not valid');
     }
    const filesData = req.files.map((file) => ({
      note,
      original_name: file.originalname,
      current_name: file.filename,
      type: file.mimetype,
      path: file.path,
      size: file.size,
      source_id,
      source,
      created_by,
    }));
    // Get existing file IDs associated with the contact
    const existingFiles = await File.find({ source_id });
    const existingFileIds = existingFiles.map(file => file._id);
    // Remove previous file records from the File collection
    await File.deleteMany({ _id: { $in: existingFileIds } });
    // Delete the physical files from the file system
    existingFiles.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    // Create new files and insert into the File collection
    const newFiles = await File.insertMany(filesData);
   
    return httpResponse.SUCCESS(res, newFiles, "Files Updated Successfully");
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err);
  }
};

const updateFile = async (req, res) => {
  try{
    const {id}=req.params;
  const { role, _id: userId } = req.user;
    const { source_id, source } = req.body;
    const filesData = req.files.map((file) => ({
      original_name: file.originalname,
      current_name: file.filename,
      type: file.mimetype,
      path: file.path,
      size: file.size,
      source_id,
      source,
      uploaded_by:req.user._id,
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

export default {
  createFile,
  getAllFiles,
  updateFile,
  deleteFiles,
  getFilesBySourceId
}