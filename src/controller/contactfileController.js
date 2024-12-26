import ContactFile from "../models/ContactFile/contactfileModel.js";
import { httpResponse } from "../utils/httpResponse.js";
// Get all files for a contact by contact ID
const getContactFileById = async (req, res) => {
  try {
    const { contactId } = req.params;
    console.log(contactId);
    const contactFiles = await ContactFile.aggregate([
      {
        $match: { contact_id: contactId } 
      },
      {
        $lookup: {
          from: 'files',         
          localField: 'file_ids', 
          foreignField: '_id',  
          as: 'fileDetails'   
        }
      },
      {
        $unwind: '$fileDetails' 
      }
    ]);

    if (!contactFiles || contactFiles.length === 0) {
      return res.status(404).json({ message: 'No files found for this contact' });
    }

    res.status(200).json({ files: contactFiles.map(cf => cf.fileDetails) }); // Return only the file details
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving files', error: error.message });
  }
};

export default {
  getContactFileById
};

