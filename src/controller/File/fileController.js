import File from '../../models/File/fileModel.js';
import { createdFileByRole, fetchFilesByRole, updateFilesByRole, deleteFilesByRole } from '../../utils/File/fileHelper.js';
import { httpResponse } from "../../utils/index.js";
const createFile = async (req, res) => {
  try {
    const { source, source_id } = req.body;
    const { role: userRole, _id: userId } = req.user;
    if (!req.files || req.files.length === 0) {
      return httpResponse.BAD_REQUEST(res, null, "Files are required");
    }
    const isAuthorized = await createdFileByRole(userId, userRole, source, source_id);
    if (!isAuthorized) {
      return httpResponse.FORBIDDEN(res, null, "You are not authorized to upload files for this Lead/Contact.");
    }
    const files = req.files.map((file) => ({
      original_name: file.originalname,
      current_name: file.filename,
      type: file.mimetype,
      path: file.path,
      size: file.size,
      source,
      source_id,
      uploaded_by: userId,
      link: `${req.protocol}://${req.get("host")}/${file.path}`,
    }));

    const createdFiles = await File.insertMany(files);
    return httpResponse.SUCCESS(res, createdFiles, "Files created successfully");
  } catch (err) {
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

export default {
  createFile,
  getAllFiles,
  updateFile,
  deleteFiles,
  getFilesBySourceId
}