import Contact from "../../models/Contact/contactModel.js";
import ContactAssignment from "../../models/Contact/assignContactModel.js"
import { httpResponse } from "../index.js";


export const deleteContactByRole = async (contactId, userId, role, res) => {
  let contact;

  if (role === "Admin" || role === "Manager") {
    await ContactAssignment.deleteMany({ contact_id:contactId });
    contact = await Contact.findByIdAndDelete(contactId);
    if (!contact) {
      return httpResponse.NOT_FOUND(res, null, "contact not found");
    }
    return httpResponse.SUCCESS(res, null, "contact deleted successfully");
  }

  if (role === "SalesRep") {
    contact = await Contact.findById(contactId);
    if (!contact) {
      return httpResponse.NOT_FOUND(res, null, "contact not found");
    }

    if (contact.created_by.toString() !== userId.toString()) {
      return httpResponse.UNAUTHORIZED(res, null, "You can only delete contacts you created");
    }

    await Contact.findByIdAndDelete(contactId);
    return httpResponse.SUCCESS(res, null, "contact deleted successfully");
  }

  // Unauthorized roles
  return httpResponse.UNAUTHORIZED(res, null, "You are not authorized to delete this contact");
};