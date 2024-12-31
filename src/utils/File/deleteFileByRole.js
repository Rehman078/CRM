import fs from 'fs';
import File from '../../models/File/fileModel.js';
import { httpResponse } from '../index.js';

export const deleteFilesByRole = async (fileSourceId, userId, role, res) => {
  
    let files;
    try{
        if (role === 'Admin' || role === 'Manager') {
            files = await File.find({ source_id: fileSourceId });
    
            if (files.length === 0) {
                return httpResponse.NOT_FOUND(res, null, 'Files not found');
              }
              // Delete files from DB
              await File.deleteMany({ source_id: fileSourceId });
              // Delete physical files
              files.forEach(file => {
                if (fs.existsSync(file.path)) {
                  fs.unlinkSync(file.path);
                }
                
              });
              return httpResponse.SUCCESS(res, null, 'Files deleted successfully');
    
    
    }
    if (role === 'SalesRep') {
        files = await File.find({ source_id: fileSourceId, uploaded_by: userId });
        if (files.length === 0) {
          return httpResponse.NOT_FOUND(res, null, 'No files found for this source or not authorized');
        }
    
        // Delete files from DB
        await File.deleteMany({ source_id: fileSourceId, uploaded_by: userId });
    
        // Delete physical files
        files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
    
        return httpResponse.SUCCESS(res, null, 'Your files were deleted successfully');
      }
    
      // Unauthorized roles
      return httpResponse.UNAUTHORIZED(res, null, 'You are not authorized to delete these files');

    }catch(err){
        return httpResponse.BAD_REQUEST(res, err.message);
    }
    

}