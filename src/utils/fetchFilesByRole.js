// utils/contactFetcher.js
import File from "../models/File/fileModel.js";
import { httpResponse } from "../utils/httpResponse.js";
export const fetchFilesByRole = async (role, userId) => {
  if (role === "Admin" || role === "Manager") {
    return File.find();
  } else if (role === "SalesRep") {
    return File.find({ uploaded_by: userId });
  } else {
    return httpResponse.UNAUTHORIZED(res, null, "Not authorized to view files");
  }
};
