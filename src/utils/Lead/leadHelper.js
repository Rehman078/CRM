import mongoose from "mongoose";
import Lead from "../../models/Lead/leadModel.js";
import LeadAsignment from "../../models/Lead/assignLeadModel.js";
import { httpResponse } from "../index.js";
import Note from "../../models/Note/noteModel.js";
import File from "../../models/File/fileModel.js";
import fs from "fs";

export const fetchLeadsByRole = async (role, userId, res) => {
  try {
    let leadPipeline = [];

    if (role === "Admin" || role === "Manager") {
      // Pipeline for Admin and Manager
      leadPipeline = [
        {
          $lookup: {
            from: "users",
            localField: "created_by",
            foreignField: "_id",
            as: "created_by_details",
          },
        },
        {
          $unwind: {
            path: "$created_by_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "updated_by",
            foreignField: "_id",
            as: "updated_by_details",
          },
        },
        {
          $unwind: {
            path: "$updated_by_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "leadasignments",
            localField: "_id",
            foreignField: "lead_id",
            as: "assignments",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "assignments.salerep_id",
            foreignField: "_id",
            as: "assignments.salerep_details",
          },
        },
        {
          $project: {
            name: 1,
            contactinfo: 1,
            leadsource: 1,
            status: 1,
            created_by: {
              id: "$created_by_details._id",
              name: "$created_by_details.name",
              email: "$created_by_details.email",
              role: "$created_by_details.role",
            },
            updated_by: {
              $cond: {
                if: {
                  $and: [
                    "$updated_by_details._id",
                    "$updated_by_details.name",
                    "$updated_by_details.email",
                  ],
                },
                then: {
                  id: "$updated_by_details._id",
                  name: "$updated_by_details.name",
                  email: "$updated_by_details.email",
                },
                else: "$$REMOVE",
              },
            },
            assigned_to: {
              $map: {
                input: "$assignments.salerep_details",
                as: "salerep",
                in: {
                  id: "$$salerep._id",
                  name: "$$salerep.name",
                  email: "$$salerep.email",
                },
              },
            },
          },
        },
      ];
    } else if (role === "SalesRep") {
      // Pipeline for SalesRep
      leadPipeline = [
        {
          $lookup: {
            from: "leadasignments",
            localField: "_id",
            foreignField: "lead_id",
            as: "assignments",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "created_by",
            foreignField: "_id",
            as: "created_by_details",
          },
        },
        {
          $unwind: {
            path: "$created_by_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "updated_by",
            foreignField: "_id",
            as: "updated_by_details",
          },
        },
        {
          $unwind: {
            path: "$updated_by_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $or: [{ "assignments.salerep_id": userId }, { created_by: userId }],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "assignments.salerep_id",
            foreignField: "_id",
            as: "assignments.salerep_details",
          },
        },
        {
          $addFields: {
            "assignments.salerep_details": {
              $filter: {
                input: "$assignments.salerep_details",
                as: "salerep",
                cond: { $eq: ["$$salerep._id", userId] },
              },
            },
          },
        },
        {
          $project: {
            name: 1,
            contactinfo: 1,
            leadsource: 1,
            status: 1,
            created_by: {
              id: "$created_by_details._id",
              name: "$created_by_details.name",
              email: "$created_by_details.email",
              role: "$created_by_details.role",
            },
            updated_by: {
              $cond: {
                if: {
                  $and: [
                    "$updated_by_details._id",
                    "$updated_by_details.name",
                    "$updated_by_details.email",
                  ],
                },
                then: {
                  id: "$updated_by_details._id",
                  name: "$updated_by_details.name",
                  email: "$updated_by_details.email",
                },
                else: "$$REMOVE",
              },
            },
            assigned_to: {
              $map: {
                input: "$assignments.salerep_details",
                as: "salerep",
                in: {
                  id: "$$salerep._id",
                  name: "$$salerep.name",
                  email: "$$salerep.email",
                },
              },
            },
          },
        },
      ];
    } else {
      return httpResponse.UNAUTHORIZED(
        res,
        null,
        "Not authorized to view leads"
      );
    }

    const leads = await Lead.aggregate(leadPipeline);

    if (!leads || leads.length === 0) {
      const message =
        role === "SalesRep"
          ? "No leads found for the sales representative"
          : "No leads found";
      return httpResponse.NOT_FOUND(res, null, message);
    }

    return httpResponse.SUCCESS(res, leads, "Leads retrieved successfully");
  } catch (error) {
    return httpResponse.BAD_REQUEST(res, error.message);
  }
};

export const getLeadsById = async (leadId, userId, role, res) => {
  try {
    let leadPipeline = [];

    if (role === "Admin" || role === "Manager") {
      // Pipeline for Admin and Manager
      leadPipeline = [
        {
          $match: { _id: new mongoose.Types.ObjectId(leadId) },
        },
        {
          $lookup: {
            from: "users",
            localField: "created_by",
            foreignField: "_id",
            as: "created_by_details",
          },
        },
        {
          $unwind: {
            path: "$created_by_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "updated_by",
            foreignField: "_id",
            as: "updated_by_details",
          },
        },
        {
          $unwind: {
            path: "$updated_by_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "leadasignments",
            localField: "_id",
            foreignField: "lead_id",
            as: "assignments",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "assignments.salerep_id",
            foreignField: "_id",
            as: "assignments.salerep_details",
          },
        },
        {
          $project: {
            name: 1,
            contactinfo: 1,
            leadsource: 1,
            status: 1,
            created_by: {
              id: "$created_by_details._id",
              name: "$created_by_details.name",
              email: "$created_by_details.email",
              role: "$created_by_details.role",
            },
            updated_by: {
              $cond: {
                if: {
                  $and: [
                    "$updated_by_details._id",
                    "$updated_by_details.name",
                    "$updated_by_details.email",
                  ],
                },
                then: {
                  id: "$updated_by_details._id",
                  name: "$updated_by_details.name",
                  email: "$updated_by_details.email",
                },
                else: "$$REMOVE",
              },
            },
            assigned_to: {
              $map: {
                input: "$assignments.salerep_details",
                as: "salerep",
                in: {
                  id: "$$salerep._id",
                  name: "$$salerep.name",
                  email: "$$salerep.email",
                },
              },
            },
          },
        },
      ];
    } else if (role === "SalesRep") {
      // Pipeline for SalesRep
      leadPipeline = [
        {
          $match: { _id: new mongoose.Types.ObjectId(leadId) },
        },
        {
          $lookup: {
            from: "leadasignments",
            localField: "_id",
            foreignField: "lead_id",
            as: "assignments",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "created_by",
            foreignField: "_id",
            as: "created_by_details",
          },
        },
        {
          $unwind: {
            path: "$created_by_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "updated_by",
            foreignField: "_id",
            as: "updated_by_details",
          },
        },
        {
          $unwind: {
            path: "$updated_by_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $or: [{ "assignments.salerep_id": userId }, { created_by: userId }],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "assignments.salerep_id",
            foreignField: "_id",
            as: "assignments.salerep_details",
          },
        },
        {
          $addFields: {
            "assignments.salerep_details": {
              $filter: {
                input: "$assignments.salerep_details",
                as: "salerep",
                cond: { $eq: ["$$salerep._id", userId] },
              },
            },
          },
        },
        {
          $project: {
            name: 1,
            contactinfo: 1,
            leadsource: 1,
            status: 1,
            created_by: {
              id: "$created_by_details._id",
              name: "$created_by_details.name",
              email: "$created_by_details.email",
              role: "$created_by_details.role",
            },
            updated_by: {
              $cond: {
                if: {
                  $and: [
                    "$updated_by_details._id",
                    "$updated_by_details.name",
                    "$updated_by_details.email",
                  ],
                },
                then: {
                  id: "$updated_by_details._id",
                  name: "$updated_by_details.name",
                  email: "$updated_by_details.email",
                },
                else: "$$REMOVE",
              },
            },
            assigned_to: {
              $map: {
                input: "$assignments.salerep_details",
                as: "salerep",
                in: {
                  id: "$$salerep._id",
                  name: "$$salerep.name",
                  email: "$$salerep.email",
                },
              },
            },
          },
        },
      ];
    } else {
      return httpResponse.UNAUTHORIZED(
        res,
        null,
        "Not authorized to view leads"
      );
    }

    const leads = await Lead.aggregate(leadPipeline);

    if (!leads || leads.length === 0) {
      const message =
        role === "SalesRep"
          ? "No leads found for the sales representative"
          : "No leads found";
      return httpResponse.NOT_FOUND(res, null, message);
    }

    return httpResponse.SUCCESS(
      res,
      leads,
      "Leads by id retrieved successfully"
    );
  } catch (error) {
    return httpResponse.BAD_REQUEST(res, error.message);
  }
};

export const updateLeadByRole = async (
  leadId,
  updatedData,
  userId,
  role,
  salerep_Ids,
  res
) => {
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

        const assignments = salerep_Ids.map((salerepId) => ({
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
      lead = await LeadAsignment.findOne({
        lead_id: leadId,
        salerep_id: userId,
      });
      if (!lead) {
        return httpResponse.NOT_FOUND(
          res,
          null,
          "You are not authorized to update this lead"
        );
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

export const deleteLeadById = async (leadId, userId, role, res) => {
  let lead;

  if (role === "Admin" || role === "Manager") {
    await LeadAsignment.deleteMany({ lead_id: leadId });
    await Note.deleteMany({ note_type: "Lead", note_to: leadId });
    // Find all files related to the contact
    const files = await File.find({ source: "Lead", source_id: leadId });
    // Loop through the files and delete them
    for (const file of files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
    // Delete all file records
    await File.deleteMany({ source: "Lead", source_id: leadId });
    lead = await Lead.findByIdAndDelete(leadId);
    if (!lead) {
      return httpResponse.NOT_FOUND(res, null, "Lead not found");
    }

    return httpResponse.SUCCESS(res, null, "Lead deleted successfully");
  }

  if (role === "SalesRep") {
    await Note.deleteMany({ note_type: "Lead", note_to: leadId });
    // Find all files related to the contact
    const files = await File.find({ source: "Lead", source_id: leadId });
    // Loop through the files and delete them
    for (const file of files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
    // Delete all file records
    await File.deleteMany({ source: "Lead", source_id: leadId });
    lead = await Lead.findById(leadId);
    if (!lead) {
      return httpResponse.NOT_FOUND(res, null, "Lead not found");
    }

    if (lead.created_by.toString() !== userId.toString()) {
      return httpResponse.UNAUTHORIZED(
        res,
        null,
        "You can only delete leads you created"
      );
    }

    await Lead.findByIdAndDelete(leadId);
    return httpResponse.SUCCESS(res, null, "Lead deleted successfully");
  }
  // Unauthorized roles
  return httpResponse.UNAUTHORIZED(
    res,
    null,
    "You are not authorized to delete this lead"
  );
};
