import File from '../../models/File/fileModel.js';
import { checkSalesRepAuthorization } from '../../utils/File/createFileByRole.js';
import { fetchFilesByRole } from '../../utils/File/fetchFilesByRole.js';
import { httpResponse } from "../../utils/index.js";
import { deleteFilesByRole } from '../../utils/File/deleteFileByRole.js';
import { updateFilesByRole } from '../../utils//File/updateFileByRole.js';
const createFile = async (req, res) => {
  try {
    const { source, source_id } = req.body;
    const userRole = req.user.role;
    const userId = req.user._id;

    if (!req.files || req.files.length === 0) {
      return httpResponse.BAD_REQUEST(res, null, 'Files are required');
    }

    if (userRole === "SalesRep") {
      const isAuthorized = await checkSalesRepAuthorization(userId, source, source_id);
      if (!isAuthorized) {
        return httpResponse.FORBIDDEN(res, null, "You are not authorized to upload files for this Lead/Contact.");
      }
    } else if (userRole !== "Admin" && userRole !== "Manager") {
      return httpResponse.FORBIDDEN(res, null, "You do not have the necessary permissions.");
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
    return httpResponse.SUCCESS(res, createdFiles, "Files Created Successfully");
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
}


// READ files on base of role
const getAllFiles = async (req, res) => {
  try {
    const { role, _id: userId } = req.user; 
    const files = await fetchFilesByRole(role, userId);

    return httpResponse.SUCCESS(res, files, "Files retrieved successfully");
  } catch (err) {
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