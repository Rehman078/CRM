import fs from "fs"
import File from '../models/File/fileModel.js';
import ContactFile from "../models/ContactFile/contactfileModel.js";
import { httpResponse } from "../utils/httpResponse.js";
const createFile = async (req, res) => {
  try {
    const { contact_id, note } = req.body;
    if (!req.files || req.files.length === 0) {
      return httpResponse.BAD_REQUEST(res, null, 'Files are required');
    }
    const filesData = req.files.map((file) => ({
      contact_id,
      note,
      original_name: file.originalname,
      current_name: file.filename,
      type: file.mimetype,
      path: file.path,
      size: file.size,
    }));
    const newFiles = await File.insertMany(filesData);
    // Find or create a ContactFile document
    let contactFile = await ContactFile.findOne({ contact_id });

    if (!contactFile) {
      contactFile = await ContactFile.create({ contact_id, file_ids: newFiles.map((file) => file._id) });
    } else {
      contactFile.file_ids.push(...newFiles.map((file) => file._id));
      await contactFile.save();
    }
    return httpResponse.CREATED(res, newFiles, "Files Uploaded Successfully");
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

//update files
const updateFile = async (req, res) => {
  try {
    const { contact_id, note } = req.body;
    if (!req.files || req.files.length === 0) {
      return httpResponse.BAD_REQUEST(res, null, 'Files are required');
    }
    const filesData = req.files.map((file) => ({
      contact_id,
      note,
      original_name: file.originalname,
      current_name: file.filename,
      type: file.mimetype,
      path: file.path,
      size: file.size,
    }));
    // Get existing file IDs associated with the contact
    const existingFiles = await File.find({ contact_id });
    const existingFileIds = existingFiles.map(file => file._id);
    // Remove previous file records from the File collection
    await File.deleteMany({ _id: { $in: existingFileIds } });
    // Remove previous file IDs from ContactFile
    await ContactFile.updateOne(
      { contact_id },
      { $set: { file_ids: [] } }
    );

    // Delete the physical files from the file system
    existingFiles.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    // Create new files and insert into the File collection
    const newFiles = await File.insertMany(filesData);
    // Extract the new file IDs
    const newFileIds = newFiles.map(file => file._id);
    // Update ContactFile with new file IDs
    await ContactFile.updateOne(
      { contact_id },
      { $push: { file_ids: { $each: newFileIds } } }
    );
    return httpResponse.SUCCESS(res, newFiles, "Files Updated Successfully");
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err);
  }
};
//delete files
const deleteFiles = async (req, res) => {
  try {
    const { contact_id } = req.params;
    // Get existing file IDs associated with the contact
    const existingFiles = await File.find({ contact_id });
    const existingFileIds = existingFiles.map(file => file._id);
    // Find and delete the ContactFile document
    const contactFile = await ContactFile.findOneAndDelete({ contact_id });
    if (!contactFile) {
      return httpResponse.NOT_FOUND(res, null, 'ContactFile not found');
    }
    // Delete files from the File model
    await File.deleteMany({ _id: { $in: contactFile.file_ids } });   

    // Delete the physical files from the file system
    existingFiles.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    return httpResponse.SUCCESS(res, null, 'Files and ContactFile deleted successfully');
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err);
  }
};



export default {
  createFile,
  getAllFiles,
  updateFile,
  deleteFiles,
}