import mongoose from "mongoose";
import { httpResponse } from "../index.js";
import Opportunity from "../../models/Opportunity/opportunityModel.js";
import ContactAssign from "../../models/Contact/assignContactModel.js";
import LeadAsign from "../../models/Lead/assignLeadModel.js";

export const createOpportunityByRole = async(userId, role, { name, expected_revenue, close_date, pipelineId, type, assignedTo }) => {
    let opportunity;
    if (role === "Admin" || role === "Manager") {
        opportunity = new Opportunity({
            name,
            expected_revenue,
            close_date,
            pipelineId,
            type,
            assignedTo,
            created_by: userId,
          });

    }
    else if(role === "SalesRep"){

        if (type === "Contact") {
            const contactAssign = await ContactAssign.findOne({ contact_id: assignedTo, salerep_id: userId });
            if (!contactAssign) {
              throw new Error("SalesRep must be assigned this contact before creating the opportunity.");
            }
          }
      
          if (type === "Lead") {
            const leadAssign = await LeadAsign.findOne({ lead_id: assignedTo, salerep_id: userId });
            if (!leadAssign) {
              throw new Error("SalesRep must be assigned this lead before creating the opportunity.");
            }
          }
      
          // Proceed to create the opportunity if the checks pass
          opportunity = new Opportunity({
            name,
            expected_revenue,
            close_date,
            pipelineId,
            type,
            assignedTo,
            created_by: userId,
          });
    }
      await opportunity.save();
      return opportunity;
}


export const getOpportunityByRole = async (userId, role, type, assignedTo) => {
    try {
      let matchCriteria = {};
  
      if (role === "Admin" || role === "Manager") {
        matchCriteria = { type, assignedTo };  
      } else if (role === "SalesRep") {
        matchCriteria = { type, assignedTo, created_by: userId }; 
      } else {
        throw new Error("Invalid role");
      }
      if (mongoose.Types.ObjectId.isValid(assignedTo)) {
        matchCriteria.assignedTo = new mongoose.Types.ObjectId(assignedTo);
      }
  
      const opportunities = await Opportunity.aggregate([
        { $match: matchCriteria },
        {
          // Lookup for the pipeline details
          $lookup: {
            from: "piplines",
            localField: "pipelineId",
            foreignField: "_id",
            as: "pipelineDetails",
          },
        },
        { $unwind: { path: "$pipelineDetails", preserveNullAndEmptyArrays: true } },
        
        // Lookup for the created_by field to get the createdBy details
        {
          $lookup: {
            from: "users",
            localField: "created_by",
            foreignField: "_id",
            as: "createdByDetails",
          },
        },
        { $unwind: { path: "$createdByDetails", preserveNullAndEmptyArrays: true } },
        
        // Lookup for the updated_by field to get the updatedBy details
        {
          $lookup: {
            from: "users",
            localField: "updated_by",
            foreignField: "_id",
            as: "updatedByDetails",
          },
        },
        { $unwind: { path: "$updatedByDetails", preserveNullAndEmptyArrays: true } },
  
        {
          $lookup: {
            from: "leads", 
            localField: "assignedTo", 
            foreignField: "_id",
            as: "assignedLead",
          },
        },
        {
          $lookup: {
            from: "contacts",
            localField: "assignedTo",
            foreignField: "_id",
            as: "assignedContact", 
          },
        },
        {
          $project: {
            name: 1,
            expected_revenue: 1,
            close_date: 1,
            type: 1,
            assignedTo: 1,
            createdAt: 1,
            updatedAt: 1,
            pipelineDetails: { _id: 1, name: 1 },
            createdByDetails: { _id: 1, name: 1, email: 1 },
            updatedByDetails: { _id: 1, name: 1, email: 1 },
            assignedLead: { _id: 1, name: 1, contactinfo: 1 },
            assignedContact: { _id: 1, name: 1, email: 1 },
          },
        },
        {
          $addFields: {
            assigned: {
              $cond: {
                if: { $gt: [{ $size: "$assignedLead" }, 0] },
                then: { $arrayElemAt: ["$assignedLead", 0] }, 
                else: { $arrayElemAt: ["$assignedContact", 0] }, 
              },
            },
          },
        },
        {
          $project: {
            name: 1,
            expected_revenue: 1,
            close_date: 1,
            type: 1,
            assignedTo: 1,
            assigned: 1, 
            createdAt: 1,
            updatedAt: 1,
            pipelineDetails: 1,
            createdByDetails: 1,
            updatedByDetails: 1,
          },
        },
      ]);
  
      return opportunities;
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      throw error;
    }
  };

  export const updateOpportunityByRole = async (oppId, updatedData, userId, role, res) => {
    try {
      let opportunities;
      if (role === "Admin" || role === "Manager") {
        opportunities = await Opportunity.findByIdAndUpdate(oppId, updatedData, {
          new: true,
          runValidators: true,
        });
        if (!opportunities) {
          return httpResponse.NOT_FOUND(res, null, "opporunity not found");
        }     
        return httpResponse.SUCCESS(res, opportunities, "opporunity updated successfully");
      }
      if (role === "SalesRep") {
        opportunities = await Opportunity.findOne({ _id: oppId, created_by: userId });
        if (!opportunities) {
          return httpResponse.NOT_FOUND(res, null, "You are not authorized to update this opportunity");
        }
        opportunities = await Opportunity.findByIdAndUpdate(oppId, updatedData, {
          new: true,
          runValidators: true,
        });
  
        return httpResponse.SUCCESS(res, opportunities, "opportunity updated successfully");
      }
  
    } catch (error) {
      return httpResponse.BAD_REQUEST(res, error.message);
    }
  };

  export const deleteOpportunityByRole = async(oppId, userId, role, res) => {
    let opportunities;
  
    if (role === "Admin" || role === "Manager") {
      
      opportunities = await Opportunity.findByIdAndDelete(oppId);
      if (!opportunities) {
        return httpResponse.NOT_FOUND(res, null, "opportunity not found");
      }

      return httpResponse.SUCCESS(res, null, "opportunty deleted successfully");
    }
  
    if (role === "SalesRep") {
      opportunities = await Opportunity.findById(oppId);
      if (!oppId) {
        return httpResponse.NOT_FOUND(res, null, "opportunity not found");
      }
  
      if (opportunities.created_by.toString() !== userId.toString()) {
        return httpResponse.UNAUTHORIZED(res, null, "You can only delete opportunity you created");
      }
  
      await Opportunity.findByIdAndDelete(oppId);
        return httpResponse.SUCCESS(res, null, "opportunity deleted successfully");
    }
    return httpResponse.UNAUTHORIZED(res, null, "You are not authorized to delete this oppounity");
}