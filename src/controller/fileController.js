import File from '../models/File/fileModel.js';
import { httpResponse } from "../utils/httpResponse.js";
import fs from 'fs';

const createFile = async (req, res) => {
  try {

    const {  note, source, source_id, uploaded_by} = req.body;
    if (!source || !source_id || !uploaded_by) {
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
      note,
      original_name: file.originalname,
      current_name: file.filename,
      type: file.mimetype,
      path: file.path,
      size: file.size,
      source,
      source_id,
      uploaded_by,
      
    }));
    const createdFiles = await File.insertMany(files);
    return httpResponse.SUCCESS(res, createdFiles, "Files Created Successfully");
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err);
  }
};

//get all files
const getAllFiles = async (req, res) => {
  try {
    const files = await File.find();
    return httpResponse.SUCCESS(res, files, "File Retrived Successfully")
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err);
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
  try {const { source_id, source, note, uploaded_by, } = req.body;

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
      uploaded_by,
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

//delete files
const deleteFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const files = await File.find({ source_id: id });
    if (files.length === 0) {
      return httpResponse.NOT_FOUND(res, null, 'Files not found');
    }
    // Delete the documents in one operation
    await File.deleteMany({ source_id: id });

    // Delete the physical files
    files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    return httpResponse.SUCCESS(res, null, 'Files deleted successfully');
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err);
  }
};




export default {
  createFile,
  getAllFiles,
  updateFile,
  deleteFiles,
  getFilesBySourceId
}