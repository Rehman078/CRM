import Lead from "../../models/Lead/leadModel.js";
import { httpResponse } from "../index.js";

export const getLeadsById = async (leadId, userId, role, res) => {
    let lead;
    const populateFields = [
      { path: "assignedsalerep", select: "name email" },
      { path: "created_by", select: "name email" },
      { path: "updated_by", select: "name email" }
    ];
    if (role === "Admin" || role === "Manager") {
        lead = await Lead.findById(leadId).populate(populateFields);
        if (!lead) return httpResponse.UNAUTHORIZED(res, null, "you are not authorized to view this lead");
        return httpResponse.SUCCESS(res, lead, "Lead retrived by id successfully");

  }
  else if (role === "SalesRep") {
    lead  = await Lead.findOne({
        _id: leadId,
      $or: [
        { assignedsalerep: userId }, // Leads assigned to the SalesRep
        { created_by: userId }        // Leads created by the SalesRep
      ]
    }).populate(populateFields);
    if (!lead) return httpResponse.NOT_FOUND(res, null, "Lead not found");
    return httpResponse.SUCCESS(res, lead, "Lead retrived by id successfully");
  }
}