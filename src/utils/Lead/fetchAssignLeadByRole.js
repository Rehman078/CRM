import Lead from "../../models/Lead/leadModel.js";
import { httpResponse } from "../index.js";

export const fetchLeadsByRoleP = async (role, userId, res) => {
  const populateFields = [
    { path: "assignedsalerep", select: "name email" },
    { path: "created_by", select: "name email" },
    { path: "updated_by", select: "name email" }
  ];
  try {
    if (role === "Admin" || role === "Manager") {
      return await Lead.find({}).populate(populateFields);
    } else if (role === "SalesRep") {
     
      return await Lead.find({
        $or: [
          { assignedsalerep: userId }, // Leads assigned to the SalesRep
          { created_by: userId }        // Leads created by the SalesRep
        ]
      }).populate(populateFields);
    } else {
      return httpResponse.UNAUTHORIZED(res, null, "Not authorized to view leads");
    }
  } catch (error) {
    return httpResponse.SERVER_ERROR(res, error.message);
  }
};

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
        {
          $project: {
            'created_by_details.createdAt':0,
            'created_by_details.updatedAt':0,
            'created_by_details.__v':0,
            'created_by_details.password':0,
            'assignments.createdAt': 0, 
            'assignments.updatedAt': 0, 
            'assignments.__v': 0, 
            'assignments.salerep_id': 0, 
            'assignments.salerep_details.createdAt':0,
            'assignments.salerep_details.updatedAt':0,
            'assignments.salerep_details.__v':0,
            'assignments.salerep_details.password':0,
            'updated_by_details.createdAt':0,
            'updated_by_details.updatedAt':0,
            'updated_by_details.__v':0,
            'updated_by_details.password':0
            
          }
        }
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
        { $unwind: { path: '$assignments', preserveNullAndEmptyArrays: true } },
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
        { $unwind: { path: '$assignments.salerep_details', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            'created_by_details.createdAt':0,
            'created_by_details.updatedAt':0,
            'created_by_details.__v':0,
            'created_by_details.password':0,
            'assignments.createdAt': 0, 
            'assignments.updatedAt': 0, 
            'assignments.__v': 0, 
            'assignments.salerep_id': 0, 
            'assignments.salerep_details.createdAt':0,
            'assignments.salerep_details.updatedAt':0,
            'assignments.salerep_details.__v':0,
            'assignments.salerep_details.password':0
          }
        }
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

    return httpResponse.SUCCESS(res, leads, 'leads retrieved successfully');
  } catch (error) {
    return httpResponse.BAD_REQUEST(res, error.message);
  }
};