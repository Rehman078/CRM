// utils/contactFetcher.js
import File from "../../models/File/fileModel.js";

export const fetchFilesByRole = async (source, source_id, role, userId) => {
  const populateFields = [
    { path: "uploaded_by", select: "name email" },
    { path: "updated_by", select: "name email" },
  ];

  try {
    const query = { source, source_id };

    if (role === "Admin" || role === "Manager") {
      // Admin and Manager can view all files with the given source and source_id
      return await File.find(query).populate(populateFields);
    } else if (role === "SalesRep") {
      // SalesRep can view files they uploaded
      query.uploaded_by = userId;
      return await File.find(query).populate(populateFields);
    } else {
      // Unauthorized roles
      throw new Error("Not authorized to view files");
    }
  } catch (err) {
    throw new Error(err.message);
  }
};
