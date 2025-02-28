import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
import { httpResponse } from "../index.js";
import Opportunity from "../../models/Opportunity/opportunityModel.js";
import ContactAssign from "../../models/Contact/assignContactModel.js";
import LeadAssign from "../../models/Lead/assignLeadModel.js";
import Lead from "../../models/Lead/leadModel.js";
import Contact from "../../models/Contact/contactModel.js";

export const createOpportunityByRole = async (
  userId,
  role,
  { name, expected_revenue, close_date, pipelineId, stageId, type, assignedTo }
) => {
  let opportunity;
  if (role === "Admin" || role === "Manager") {
    opportunity = new Opportunity({
      name,
      expected_revenue,
      close_date,
      pipelineId,
      stageId,
      type,
      assignedTo,
      created_by: userId,
    });
  } else if (role === "SalesRep") {
    if (type === "Contact") {
      const contact = await Contact.findOne({
        created_by: userId,
        _id: assignedTo,
      });
      // If the SalesRep is the creator, create the opportunity
      if (contact) {
        opportunity = new Opportunity({
          name,
          expected_revenue,
          close_date,
          pipelineId,
          stageId,
          type,
          assignedTo,
          created_by: userId,
        });
      } else {
        const contactAssign = await ContactAssign.findOne({
          contact_id: assignedTo,
          salerep_id: userId,
        });

        if (contactAssign) {
          opportunity = new Opportunity({
            name,
            expected_revenue,
            close_date,
            pipelineId,
            stageId,
            type,
            assignedTo,
            created_by: userId,
          });
        } else {
          throw new Error(
            "SalesRep must be either the creator or assigned to the contact to create the opportunity."
          );
        }
      }
    }

    if (type === "Lead") {
      const lead = await Lead.findOne({ created_by: userId, _id: assignedTo });
      if (lead) {
        opportunity = new Opportunity({
          name,
          expected_revenue,
          close_date,
          pipelineId,
          stageId,
          type,
          assignedTo,
          created_by: userId,
        });
      } else {
        const leadAssign = await LeadAssign.findOne({
          lead_id: assignedTo,
          salerep_id: userId,
        });

        if (leadAssign) {
          opportunity = new Opportunity({
            name,
            expected_revenue,
            close_date,
            pipelineId,
            stageId,
            type,
            assignedTo,
            created_by: userId,
          });
        } else {
          throw new Error(
            "SalesRep must be either the creator or assigned to the lead to create the opportunity."
          );
        }
      }
    }
  }

  await opportunity.save();
  return opportunity;
};

export const getOpportunityByRole = async (userId, role) => {
  try {
    let matchCriteria = {};
    if (role === "Admin" || role === "Manager") {
      // No additional filtering for Admin or Manager
    } else if (role === "SalesRep") {
      ;
    } else {
      throw new Error("Invalid role");
    }

    const opportunities = await Opportunity.aggregate([
      // { $match: matchCriteria }

      {
        $lookup: {
          from: "stages",
          localField: "stageId",
          foreignField: "_id",
          as: "stageName",
        },
      },
      {
        $unwind: { path: "$stageName", preserveNullAndEmptyArrays: true },
      },      
      // Lookup for the pipeline details
      {
        $lookup: {
          from: "pipelines", // Ensure this matches the actual collection name
          localField: "pipelineId",
          foreignField: "_id",
          as: "pipelineDetails",
        },
      },
      {
        $unwind: { path: "$pipelineDetails", preserveNullAndEmptyArrays: true },
      },

      // Lookup for all stages related to the pipeline and group them into an array
      {
        $lookup: {
          from: "stages",
          let: { pipelineId: "$pipelineId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$pipline_id", "$$pipelineId"] } } },
            { $project: { _id: 1, stage: 1 } }, // Include necessary fields
          ],
          as: "stages",
        },
      },

      // Lookup for created_by field to get the user details
      {
        $lookup: {
          from: "users",
          localField: "created_by",
          foreignField: "_id",
          as: "createdByDetails",
        },
      },
      {
        $unwind: {
          path: "$createdByDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lookup for updated_by field to get the user details
      {
        $lookup: {
          from: "users",
          localField: "updated_by",
          foreignField: "_id",
          as: "updatedByDetails",
        },
      },
      {
        $unwind: {
          path: "$updatedByDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lookup for assigned leads and contacts
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

      // Project required fields
      {
        $project: {
          name: 1,
          expected_revenue: 1,
          close_date: 1,
          type: 1,
          assignedTo: 1,
          createdAt: 1,
          updatedAt: 1,
          stageName: { _id: 1, stage: 1 },
          pipelineDetails: { _id: 1, name: 1 },
          stages: 1, // Now includes all stages in an array
          createdByDetails: { _id: 1, name: 1, email: 1 },
          updatedByDetails: { _id: 1, name: 1, email: 1 },
          assignedLead: { _id: 1, name: 1, contactinfo: 1 },
          assignedContact: { _id: 1, name: 1, email: 1 },
        },
      },

      // Merge assignedLead and assignedContact into a single field
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

      // Final projection
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
          stageName: { _id: 1, stage: 1 },
          pipelineDetails: 1,
          stages: 1, // This now contains all stage details in an array
          createdByDetails: 1,
          updatedByDetails: 1,
        },
      },
    ]);
    console.log("opportunities", opportunities);
    return opportunities;
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    throw error;
  }
};

export const getOpportunityByIdRole = async (
  userId,
  role,
  type,
  assignedTo
) => {
  try {
    let matchCriteria = {};

    if (role === "Admin" || role === "Manager") {
      matchCriteria = { type, assignedTo: new ObjectId(assignedTo) };
    } else if (role === "SalesRep") {
      matchCriteria = { type, assignedTo: new ObjectId(assignedTo) };
    }

    const opportunities = await Opportunity.aggregate([
      { $match: matchCriteria },
      {
        $lookup: {
          from: "stages",
          localField: "stageId",
          foreignField: "_id",
          as: "stageName",
        },
      },
      {
        $unwind: { path: "$stageName", preserveNullAndEmptyArrays: true },
      },   
      {
        $lookup: {
          from: "piplines",
          localField: "pipelineId",
          foreignField: "_id",
          as: "pipelineDetails",
        },
      },
      {
        $unwind: { path: "$pipelineDetails", preserveNullAndEmptyArrays: true },
      },

      {
        $lookup: {
          from: "stages",
          let: { pipelineId: "$pipelineId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$pipline_id", "$$pipelineId"] } } },
            { $project: { _id: 1, stage: 1 } },
          ],
          as: "stages",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "created_by",
          foreignField: "_id",
          as: "createdByDetails",
        },
      },
      {
        $unwind: {
          path: "$createdByDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "updated_by",
          foreignField: "_id",
          as: "updatedByDetails",
        },
      },
      {
        $unwind: {
          path: "$updatedByDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

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
          stageName: { _id: 1, stage: 1 },
          stages: 1,
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
          stageName: { _id: 1, stage: 1 },
          stages: 1,
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

export const getOpportunityByPipelineIdAndRole = async (userId, role, pipelineId) => {
  try {
    let matchCriteria = {};

    if (role === "Admin" || role === "Manager") {
      matchCriteria = { pipelineId: new ObjectId(pipelineId) };
    } else if (role === "SalesRep") {
      matchCriteria = { pipelineId: new ObjectId(pipelineId) };
    }
    const opportunities = await Opportunity.aggregate([
      { $match: matchCriteria },
      {
        $lookup: {
          from: "stages",
          localField: "stageId",
          foreignField: "_id",
          as: "stageName",
        },
      },
      {
        $unwind: { path: "$stageName", preserveNullAndEmptyArrays: true },
      },   
      {
        $lookup: {
          from: "piplines",
          localField: "pipelineId",
          foreignField: "_id",
          as: "pipelineDetails",
        },
      },
      {
        $unwind: { path: "$pipelineDetails", preserveNullAndEmptyArrays: true },
      },

      {
        $lookup: {
          from: "stages",
          let: { pipelineId: "$pipelineId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$pipline_id", "$$pipelineId"] } } },
            { $project: { _id: 1, stage: 1 } },
          ],
          as: "stages",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "created_by",
          foreignField: "_id",
          as: "createdByDetails",
        },
      },
      {
        $unwind: {
          path: "$createdByDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "updated_by",
          foreignField: "_id",
          as: "updatedByDetails",
        },
      },
      {
        $unwind: {
          path: "$updatedByDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

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
          stageName: { _id: 1, stage: 1 },
          stages: 1,
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
          stageName: { _id: 1, stage: 1 },
          stages: 1,
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
  

export const updateOpportunityByRole = async (oppId, updatedData, userId, role) => {
  try {
    let opportunity;

    if (role === "Admin" || role === "Manager") {
      opportunity = await Opportunity.findByIdAndUpdate(oppId, updatedData, {
        new: true,
        runValidators: true,
      });
      return opportunity;
    }

    if (role === "SalesRep") {
      opportunity = await Opportunity.findOne({
        _id: oppId,
        created_by: userId,
      });

      if (!opportunity) {
        return null;
      }

      opportunity = await Opportunity.findByIdAndUpdate(oppId, updatedData, {
        new: true,
        runValidators: true,
      });

      return opportunity; 
    }

    return null; 
  } catch (error) {
    console.error("Error updating opportunity:", error);
    throw new Error(error.message); // Throw error instead of sending response
  }
};


export const deleteOpportunityByRole = async (oppId, userId, role, res) => {
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
      return httpResponse.UNAUTHORIZED(
        res,
        null,
        "You can only delete opportunity you created"
      );
    }

    await Opportunity.findByIdAndDelete(oppId);
    return httpResponse.SUCCESS(res, null, "opportunity deleted successfully");
  }
  return httpResponse.UNAUTHORIZED(
    res,
    null,
    "You are not authorized to delete this oppounity"
  );
};
