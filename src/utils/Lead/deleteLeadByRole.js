import Lead from "../../models/Lead/leadModel.js"
import LeadAsignment from "../../models/Lead/assignLeadModel.js";
import { httpResponse } from "./../index.js";

export const deleteLeadById = async (leadId, userId, role, res) => {
    let lead;
  
    if (role === "Admin" || role === "Manager") {
      
      await LeadAsignment.deleteMany({ lead_id:leadId });
      lead = await Lead.findByIdAndDelete(leadId);
      if (!lead) {
        return httpResponse.NOT_FOUND(res, null, "Lead not found");
      }

      return httpResponse.SUCCESS(res, null, "Lead deleted successfully");
    }
  
    if (role === "SalesRep") {
      lead = await Lead.findById(leadId);
      if (!lead) {
        return httpResponse.NOT_FOUND(res, null, "Lead not found");
      }
  
      if (lead.created_by.toString() !== userId.toString()) {
        return httpResponse.UNAUTHORIZED(res, null, "You can only delete leads you created");
      }
  
      await Lead.findByIdAndDelete(leadId);
        return httpResponse.SUCCESS(res, null, "Lead deleted successfully");
    }
    // Unauthorized roles
    return httpResponse.UNAUTHORIZED(res, null, "You are not authorized to delete this lead");
  };