import Contact from "../../models/Contact/contactModel.js"
import { httpResponse } from "../index.js";

export const updateContactByRole = async (contactId, updatedData, userId, role, res) => {
    try {
      let contact;
  
      if (role === "Admin" || role === "Manager") {
        contact= await Contact.findByIdAndUpdate(contactId, updatedData, {
          new: true,
          runValidators: true,
        });
        if (!contact) {
          return httpResponse.NOT_FOUND(res, null, "contact not found");
        }
        return httpResponse.SUCCESS(res, contact, "Contact updated successfully");
      }
  
      if (role === "SalesRep") {
        contact = await Contact.findById(contactId);
        if (!contact) {
          return httpResponse.NOT_FOUND(res, null, "contact not found");
        }
  
        if (contact.created_by.toString() !== userId.toString()) {
          return httpResponse.FORBIDDEN(res, null, "You can only update contacts you created");
        }
  
        contact = await Contact.findByIdAndUpdate(contactId, updatedData, {
          new: true,
          runValidators: true,
        });
        return httpResponse.SUCCESS(res, contact, "Contact updated successfully");
      }
  
      return httpResponse.FORBIDDEN(res, null, "You are not authorized to update this contact");
    } catch (error) {
      return httpResponse.BAD_REQUEST(res, error.message);
    }
  };
  