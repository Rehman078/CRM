import Lead from "../../models/Lead/leadModel.js";
import { httpResponse } from "../index.js";

export const fetchLeadsByRole = async (role, userId, res) => {
  try {
    if (role === "Admin" || role === "Manager") {
      return await Lead.find();
    } else if (role === "SalesRep") {
     
      return await Lead.find({
        $or: [
          { assignedsalerep: userId }, // Leads assigned to the SalesRep
          { created_by: userId }        // Leads created by the SalesRep
        ]
      });
    } else {
      return httpResponse.UNAUTHORIZED(res, null, "Not authorized to view leads");
    }
  } catch (error) {
    return httpResponse.SERVER_ERROR(res, error.message);
  }
};
