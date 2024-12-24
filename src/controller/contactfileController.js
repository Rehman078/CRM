import ContactFile from "../models/ContactFile/contactfileModel.js";
import { httpResponse } from "../utils/httpResponse.js";
// create contact file
const createContactFile = async (req, res) => {
   try{
    const {contact_id, file_ids} =req.body;
    const fileContact = new ContactFile({
        contact_id,
        file_ids
    })
    await fileContact.save();
    return httpResponse.CREATED(res, fileContact, "File Contact Created Successfully");
   }catch(err){
    return httpResponse.BAD_REQUEST(res, err)
   }
}

// get contact file
const getAllContactFiles = async (req, res) => {
    try {
        const contactFiles = await ContactFile.aggregate([
            {
                $lookup: {
                    from: "contacts",
                    localField: "contact_id",
                    foreignField: "_id", 
                    as: "contact_details",
                },
            },
            {
                $unwind: "$contact_details"
            },
            {
                $lookup: {
                    from: "files",
                    localField: "file_ids",
                    foreignField: "_id",
                    as: "file_details",
                },
            },
            {
                $unwind: "$file_details"
            },
            {
                $project: {
                    contact_id: 0,
                    file_ids: 0,
                    createdAt:0,     
                    updatedAt:0, 
                    __v:0,
                    'file_details.note': 0,
                    'file_details.__v': 0,
                    'file_details.createdAt': 0,
                    'file_details.updatedAt': 0,
                    'contact_details.__v': 0,
                    'contact_details.createdAt': 0,
                    'contact_details.updatedAt': 0,
                }
            }

        ]);

        return httpResponse.SUCCESS(res, contactFiles, "File Contact Retrived Successfully");
    } catch (err) {
        return httpResponse.BAD_REQUEST(res, err);
    }
};

//update contact file
const updateContactFiles = async (req, res) => {
    try {
      const { contact_id, file_ids } = req.body;
      const updatedContactFile = await ContactFile.findByIdAndUpdate(
        req.params.id,
        { contact_id, file_ids },
        {
          new: true,
          runValidators: true,
        }
      );
      if (!updatedContactFile) {
        return httpResponse.NOT_FOUND(res,null, "Contact File not found");
      }  
      return httpResponse.SUCCESS(res, updatedContactFile,"Contact File Updated Successfully");
    } catch (err) {
      return httpResponse.BAD_REQUEST(res, err);
    }
  };

//delete contact file
const deleteContactFile = async (req, res) => {
     try {
        const deletedContact = await ContactFile.findByIdAndDelete(req.params.id);
        if(!deletedContact) return httpResponse.NOT_FOUND(res, null, "Contact File not found")
        return httpResponse.SUCCESS(res, deletedContact, "Contact File Deleted Successfully" );
      } catch (err) {
        return httpResponse.BAD_REQUEST(res, err);
      }
};



export default {
    createContactFile,
    getAllContactFiles,
    updateContactFiles,
    deleteContactFile
}
