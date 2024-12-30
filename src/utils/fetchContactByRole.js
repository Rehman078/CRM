// utils/contactFetcher.js
import Contact from "../models/Contact/contactModel.js";
import { httpResponse } from "../utils/httpResponse.js";
export const fetchContactsByRole = async (role, userId) => {
  if (role === "Admin" || role === "Manager") {
    return Contact.find();
  } else if (role === "SalesRep") {
    return Contact.find({ created_by: userId });
  } else {
    return httpResponse.UNAUTHORIZED(res, null, "Not authorized to view contacts");
  }
};
