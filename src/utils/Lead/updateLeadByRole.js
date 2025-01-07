import Lead from "../../models/Lead/leadModel.js";
import LeadAsignment from "../../models/Lead/assignLeadModel.js"
import { httpResponse } from "../index.js";

export const updateLeadByRole = async (leadId, updatedData, userId, role, salerep_Ids, res) => {
  try {
    let lead;

    if (role === "Admin" || role === "Manager") {
      lead = await Lead.findByIdAndUpdate(leadId, updatedData, {
        new: true,
        runValidators: true,
      });

      if (!lead) {
        return httpResponse.NOT_FOUND(res, null, "lead not found");
      }

      if (salerep_Ids && Array.isArray(salerep_Ids)) {
        await LeadAsignment.deleteMany({ lead_id: leadId });

        const assignments = salerep_Ids.map(salerepId => ({
          lead_id: leadId,
          salerep_id: salerepId,
          assigned_by: userId,
        }));

        await LeadAsignment.insertMany(assignments);
      }

      return httpResponse.SUCCESS(res, lead, "Lead updated successfully");
    }

    
    if (role === "SalesRep") {
      lead = await Lead.findOne({ _id: leadId, created_by: userId });
      if (!lead) {
        return httpResponse.NOT_FOUND(res, null, "You are not authorized to update this lead");
      }

      lead = await Lead.findByIdAndUpdate(leadId, updatedData, {
        new: true,
        runValidators: true,
      });

      return httpResponse.SUCCESS(res, lead, "Lead updated successfully");
    }

  } catch (error) {
    return httpResponse.BAD_REQUEST(res, error.message);
  }
};
  