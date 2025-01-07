import File from "../../models/File/fileModel.js";
import { httpResponse } from "../../utils/index.js";
import fs from "fs";

export const updateFilesByRole = async (fileSourceId, updatedData, userId, role, res) => {
  try {

    let file;

    if (role === "Admin" || role === "Manager") {
      // Find the file by ID
      file = await File.findOne({ source_id: fileSourceId });
      if (!file) {
        return httpResponse.NOT_FOUND(res, null, "File not found");
      }

      // Find and remove all files with the same source_id
      const existingFiles = await File.find({ source_id: fileSourceId });
      const existingFileIds = existingFiles.map(file => file._id);

      await File.deleteMany({ _id: { $in: existingFileIds } });

      // Delete physical files
      existingFiles.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      // Insert new files
      const newFiles = await File.insertMany(updatedData);
      return httpResponse.SUCCESS(res, newFiles, "Files updated successfully");
    } else if (role === "SalesRep") {
      // Find the file by source_id and verify ownership
      file = await File.findOne({ source_id: fileSourceId });
      if (!file) {
        return httpResponse.NOT_FOUND(res, null, "File not found");
      }

      if (file.uploaded_by.toString() !== userId.toString()) {
        return httpResponse.FORBIDDEN(res, null, "You can only update files you created");
      }

      // Find and remove all files with the same source_id
      const existingFiles = await File.find({ source_id: fileSourceId });
      const existingFileIds = existingFiles.map(file => file._id);

      await File.deleteMany({ _id: { $in: existingFileIds } });

      // Delete physical files
      existingFiles.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      // Insert new files
      const newFiles = await File.insertMany(updatedData);
      return httpResponse.SUCCESS(res, newFiles, "Files updated successfully");
    } else {
      return httpResponse.UNAUTHORIZED(res, null, "Not authorized to update files");
    }
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};
