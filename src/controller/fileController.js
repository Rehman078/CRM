import fs from "fs"
import File from '../models/File/fileModel.js';
import { httpResponse } from "../utils/httpResponse.js";

//create file
 const createFile = async (req, res) => {
  try {
    const { note } = req.body;
    const filePath = req.file.path;
    const file = new File({
      note,
      filePath
    })
    await file.save();
    return httpResponse.CREATED(res, file, "File Created Successfully")
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err)
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

//get file by id
const getFileById = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return httpResponse.NOT_FOUND(res, null, 'File not found')
    }
    return httpResponse.SUCCESS(res, file, "File Retrived Successfully")
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err)
  }
};

//update file
const updateFile = async (req, res) => {
  try {
    const { note } = req.body;
    const existingFile = await File.findById(req.params.id);
    if (!existingFile) {
      return httpResponse.NOT_FOUND(res, null, 'File not found')
    }
    const oldFilePath = existingFile.filePath;
    const newFilePath = req.file ? req.file.path : oldFilePath;
    if (req.file && oldFilePath) {
      fs.unlinkSync(oldFilePath);
    }
    const updatedFile = await File.findByIdAndUpdate(
      req.params.id,
      { note, filePath: newFilePath },
      { new: true }
    );
    return httpResponse.SUCCESS(res, updatedFile, "File Updated Successfully");
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message || err);
  }
};

//delete file
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return httpResponse.NOT_FOUND(res, null, 'File not found')
    }
    // Delete the physical file from the file system
    fs.unlinkSync(file.filePath);
    await File.findByIdAndDelete(req.params.id);
    return httpResponse.SUCCESS(res, file, "File Deleted Successfully");
  } catch (err) {
   return httpResponse.BAD_REQUEST(res, err);
  }
};

export default {
  createFile,
  getAllFiles,
  getFileById,
  updateFile,
  deleteFile
}