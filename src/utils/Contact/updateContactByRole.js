import Contact from "../../models/Contact/contactModel.js";
import ContactAsignment from "../../models/Contact/assignContactModel.js";
import { httpResponse } from "../index.js";

export const updateContactByRole = async (contactId, updatedData, userId, role, salerep_Ids, res) => {
  try {
    let contact;

    if (role === "Admin" || role === "Manager") {
      contact = await Contact.findByIdAndUpdate(contactId, updatedData, {
        new: true,
        runValidators: true,
      });

      if (!contact) {
        return httpResponse.NOT_FOUND(res, null, "Contact not found");
      }

      if (salerep_Ids && Array.isArray(salerep_Ids)) {
        await ContactAsignment.deleteMany({ contact_id: contactId });

        const assignments = salerep_Ids.map(salerepId => ({
          contact_id: contactId,
          salerep_id: salerepId,
          assigned_by: userId,
        }));

        await ContactAsignment.insertMany(assignments);
      }

      return httpResponse.SUCCESS(res, contact, "Contact updated successfully");
    }

    
    if (role === "SalesRep") {
      contact = await Contact.findOne({ _id: contactId, created_by: userId });
      if (!contact) {
        return httpResponse.NOT_FOUND(res, null, "You are not authorized to update this contact");
      }

      contact = await Contact.findByIdAndUpdate(contactId, updatedData, {
        new: true,
        runValidators: true,
      });

      return httpResponse.SUCCESS(res, contact, "Contact updated successfully");
    }

  } catch (error) {
    return httpResponse.BAD_REQUEST(res, error.message);
  }
};