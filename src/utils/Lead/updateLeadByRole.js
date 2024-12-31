import Lead from "../../models/Lead/leadModel.js";
import { httpResponse } from "../index.js";

export const updateLeadById = async (leadId, updatedData, userId, role, res) => {
    try {
      let lead;
  
      if (role === "Admin" || role === "Manager") {
        lead = await Lead.findByIdAndUpdate(leadId, updatedData, {
          new: true,
          runValidators: true,
        });
        if (!lead) {
          return httpResponse.NOT_FOUND(res, null, "Lead not found");
        }
        return httpResponse.SUCCESS(res, lead, "Lead updated successfully");
      }
  
      if (role === "SalesRep") {
        lead = await Lead.findById(leadId);
        if (!lead) {
          return httpResponse.NOT_FOUND(res, null, "Lead not found");
        }
  
        if (lead.created_by.toString() !== userId.toString()) {
          return httpResponse.FORBIDDEN(res, null, "You can only update leads you created");
        }
  
        lead = await Lead.findByIdAndUpdate(leadId, updatedData, {
          new: true,
          runValidators: true,
        });
        return httpResponse.SUCCESS(res, lead, "Lead updated successfully");
      }
  
      return httpResponse.FORBIDDEN(res, null, "You are not authorized to update this lead");
    } catch (error) {
      return httpResponse.BAD_REQUEST(res, error.message);
    }
  };
  