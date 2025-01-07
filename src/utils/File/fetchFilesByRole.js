// utils/contactFetcher.js
import File from "../../models/File/fileModel.js";
import { httpResponse } from "../../utils/index.js";
export const fetchFilesByRole = async (role, userId) => {
  const populateFields = [
    // { path: "assignedsalerep", select: "name email" },
    { path: "uploaded_by", select: "name email" },
    { path: "updated_by", select: "name email" }
  ];

  if (role === "Admin" || role === "Manager") {
    return File.find({}).populate(populateFields);
  } else if (role === "SalesRep") {
    return File.find({ uploaded_by: userId }).populate(populateFields);
  } else {
    return httpResponse.UNAUTHORIZED(res, null, "Not authorized to view files");
  }
};
