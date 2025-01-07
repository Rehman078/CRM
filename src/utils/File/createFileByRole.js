import Lead from "../../models/Lead/leadModel.js";
import Contact from "../../models/Contact/contactModel.js";
export const checkSalesRepAuthorization = async (userId, source, source_id) => {
  try {
    if (source === "Lead") {
      const lead = await Lead.findOne({ _id: source_id, $or: [{ assignedsalerep: userId }, { created_by: userId }] });
      return !!lead;
    } else if (source === "Contact") {
      const contact = await Contact.findOne({ _id: source_id, $or: [{ assignedsalerep: userId }, { created_by: userId }] });
      return !!contact;
    }
    return false;
  } catch (err) {
    return false;
  }
};