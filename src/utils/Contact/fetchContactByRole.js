import Contact from "../../models/Contact/contactModel.js";
import { httpResponse } from "../index.js";

export const fetchContactsByRole = async (role, userId, res) => {
  try {
    let contactPipeline = [];

    if (role === 'Admin' || role === 'Manager') {
      // Pipeline for Admin and Manager
      contactPipeline = [
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
            from: 'contactasignments',
            localField: '_id',
            foreignField: 'contact_id',
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
      contactPipeline = [
        {
          $lookup: {
            from: 'contactasignments',
            localField: '_id',
            foreignField: 'contact_id',
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
      return httpResponse.UNAUTHORIZED(res, null, 'Not authorized to view contacts');
    }

    const contacts = await Contact.aggregate(contactPipeline);

    if (!contacts || contacts.length === 0) {
      const message =
        role === 'SalesRep'
          ? 'No contacts found for the sales representative'
          : 'No contacts found';
      return httpResponse.NOT_FOUND(res, null, message);
    }

    return httpResponse.SUCCESS(res, contacts, 'Contacts retrieved successfully');
  } catch (error) {
    return httpResponse.BAD_REQUEST(res, error.message);
  }
};



