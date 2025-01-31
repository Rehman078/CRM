import mongoose from "mongoose";
import Lead from "../../models/Lead/leadModel.js";
import LeadAsignment from "../../models/Lead/assignLeadModel.js"
import { httpResponse } from "../index.js";

export const fetchLeadsByRole = async (role, userId, res) => {
  try {
    let leadPipeline = [];

    if (role === 'Admin' || role === 'Manager') {
      // Pipeline for Admin and Manager
      leadPipeline = [
        {
          $lookup: {
            from: 'users',
            localField: 'created_by',
            foreignField: '_id',
            as: 'created_by_details',
          },
        },
        { $unwind: { path: '$created_by_details', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'updated_by',
            foreignField: '_id',
            as: 'updated_by_details',
          },
        },
        { $unwind: { path: '$updated_by_details', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'leadasignments',
            localField: '_id',
            foreignField: 'lead_id',
            as: 'assignments',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'assignments.salerep_id',
            foreignField: '_id',
            as: 'assignments.salerep_details',
          },
        },
        {
          $project: {
            name: 1,
            contactinfo: 1,
            leadsource: 1,
            status: 1,
            created_by: {
              id: '$created_by_details._id',
              name: '$created_by_details.name',
              email: '$created_by_details.email',
              role: '$created_by_details.role',
            },
            updated_by: {
              $cond: {
                if: { $and: ['$updated_by_details._id', '$updated_by_details.name', '$updated_by_details.email'] },
                then: {
                  id: '$updated_by_details._id',
                  name: '$updated_by_details.name',
                  email: '$updated_by_details.email',
                },
                else: '$$REMOVE',
              },
            },
            assigned_to: {
              $map: {
                input: '$assignments.salerep_details',
                as: 'salerep',
                in: {
                  id: '$$salerep._id',
                  name: '$$salerep.name',
                  email: '$$salerep.email',
                },
              },
            },
          },
        },
      ];
    } else if (role === 'SalesRep') {
      // Pipeline for SalesRep
      leadPipeline = [
        {
          $lookup: {
            from: 'leadasignments',
            localField: '_id',
            foreignField: 'lead_id',
            as: 'assignments',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'created_by',
            foreignField: '_id',
            as: 'created_by_details',
          },
        },
        { $unwind: { path: '$created_by_details', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'updated_by',
            foreignField: '_id',
            as: 'updated_by_details',
          },
        },
        { $unwind: { path: '$updated_by_details', preserveNullAndEmptyArrays: true } },
        {
          $match: {
            $or: [
              { 'assignments.salerep_id': userId },
              { created_by: userId },
            ],
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'assignments.salerep_id',
            foreignField: '_id',
            as: 'assignments.salerep_details',
          },
        },
        {
          $addFields: {
            'assignments.salerep_details': {
              $filter: {
                input: '$assignments.salerep_details',
                as: 'salerep',
                cond: { $eq: ['$$salerep._id', userId] },
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
              id: '$created_by_details._id',
              name: '$created_by_details.name',
              email: '$created_by_details.email',
              role: '$created_by_details.role',
            },
            updated_by: {
              $cond: {
                if: { $and: ['$updated_by_details._id', '$updated_by_details.name', '$updated_by_details.email'] },
                then: {
                  id: '$updated_by_details._id',
                  name: '$updated_by_details.name',
                  email: '$updated_by_details.email',
                },
                else: '$$REMOVE',
              },
            },
            assigned_to: {
              $map: {
                input: '$assignments.salerep_details',
                as: 'salerep',
                in: {
                  id: '$$salerep._id',
                  name: '$$salerep.name',
                  email: '$$salerep.email',
                },
              },
            },
          },
        },
      ];
    } else {
      return httpResponse.UNAUTHORIZED(res, null, 'Not authorized to view leads');
    }

    const leads = await Lead.aggregate(leadPipeline);

    if (!leads || leads.length === 0) {
      const message =
        role === 'SalesRep'
          ? 'No leads found for the sales representative'
          : 'No leads found';
      return httpResponse.NOT_FOUND(res, null, message);
    }

    return httpResponse.SUCCESS(res, leads, 'Leads retrieved successfully');
  } catch (error) {
    return httpResponse.BAD_REQUEST(res, error.message);
  }
};

export const getLeadsById = async (leadId, userId, role, res) => {
    try {
      let leadPipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(leadId) } },
        {
          $lookup: {
            from: 'users',
            localField: 'created_by',
            foreignField: '_id',
            as: 'created_by_details',
          },
        },
        { $unwind: { path: '$created_by_details', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'updated_by',
            foreignField: '_id',
            as: 'updated_by_details',
          },
        },
        { $unwind: { path: '$updated_by_details', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'leadasignments',
            localField: '_id',
            foreignField: 'lead_id',
            as: 'assignments',
          },
        },
        { $unwind: { path: '$assignments', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'assignments.salerep_id',
            foreignField: '_id',
            as: 'assignments.salerep_details',
          },
        },
        { $unwind: { path: '$assignments.salerep_details', preserveNullAndEmptyArrays: true } },
      ];
  
      if (role === 'SalesRep') {
        leadPipeline.push({
          $match: {
            $or: [
              { 'assignments.salerep_id': new mongoose.Types.ObjectId(userId) },
              { created_by: new mongoose.Types.ObjectId(userId) },
            ],
          },
        });
      }
  
      leadPipeline.push({
        $project: {
          name: 1,
          contactinfo: 1,
          leadsource: 1,
          status: 1,
          created_by: {
            id: '$created_by_details._id',
            name: '$created_by_details.name',
            email: '$created_by_details.email',
          },
          updated_by: {
            $cond: {
              if: { $and: ['$updated_by_details._id', '$updated_by_details.name', '$updated_by_details.email'] },
              then: {
                id: '$updated_by_details._id',
                name: '$updated_by_details.name',
                email: '$updated_by_details.email',
              },
              else: '$$REMOVE',
            },
          },
          assigned_to: {
            $cond: {
              if: { $and: ['$assignments.salerep_details._id', '$assignments.salerep_details.name', '$assignments.salerep_details.email'] },
              then: {
                id: '$assignments.salerep_details._id',
                name: '$assignments.salerep_details.name',
                email: '$assignments.salerep_details.email',
              },
              else: '$$REMOVE',
            },
          },
        },
      });
  
      const lead = await Lead.aggregate(leadPipeline);
  
      if (!lead || lead.length === 0) {
        return httpResponse.UNAUTHORIZED(res, null, "you are not authorized to get this lead");
      }
  
      return httpResponse.SUCCESS(res, lead[0], 'Lead retrieved by ID successfully');
    } catch (error) {
      console.error(error);
      return httpResponse.BAD_REQUEST(res, error.message);
    }
  };
  
  

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
        lead = await LeadAsignment.findOne({lead_id:leadId, salerep_id:userId});
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