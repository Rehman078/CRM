import Lead from "../../models/Lead/leadModel.js";
import { httpResponse } from "../../utils/index.js";
import {validateLead}  from "../../validations/leadValidation.js";
import { fetchLeadsByRole } from "../../utils/Lead/fetchAssignLeadByRole.js";
import { deleteLeadById } from "../../utils/Lead/deleteLeadByRole.js";
import { updateLeadById } from "../../utils/Lead/updateLeadByRole.js";

//create lead
const createLead = async (req, res) => {
    try {
        const { name, contactinfo, leadsource, assignedsalerep, status, created_by} = req.body;
        const { error } = validateLead(req.body);
          if (error) return res.status(400).send(error.details[0].message);
        const lead = new Lead(
            {
                name,
                contactinfo,
                leadsource,
                assignedsalerep,
                status,
                created_by: created_by || req.user._id
            }
        );
        await lead.save();
        return httpResponse.SUCCESS(res, lead, "Lead created successfully");
    } catch (err) {
        return httpResponse.BAD_REQUEST(res, err.message);
    }}

//get all leads
const getLeads = async (req, res) => {
    try {
        const {role, _id:userId}= req.user;
        const leads = await fetchLeadsByRole(role, userId);
        return httpResponse.SUCCESS(res, leads, "All leads fetched successfully");
    } catch (err) {
        return httpResponse.BAD_REQUEST(res, err.message);
    }
}
//get lead by id
const getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return httpResponse.NOT_FOUND(res, "Lead not found");
        return httpResponse.SUCCESS(res, lead, "Lead fetched successfully");
    } catch (err) {
        return httpResponse.BAD_REQUEST(res, err.message);
    }
}

//update lead
const updateLead = async (req, res) => {
  const { name, contactinfo, leadsource, assignedsalerep, status } = req.body;

  // Validate request body
  const { error } = validateLead(req.body);
  if (error) return httpResponse.BAD_REQUEST(res, error.details[0].message);

  try {
    const id = req.params.id;
    const { role, _id: userId } = req.user;

    const updatedData = { name, contactinfo, leadsource, assignedsalerep, status };
    return await updateLeadById(id, updatedData, userId, role, res);
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

//delete lead
const deleteLead = async (req, res) => {
  try {
    const { id } = req.params; 
    const { role, _id: userId } = req.user; 

    // Delete lead by id
    const message = await deleteLeadById(id, userId, role, res);

  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

//lead assign
const assignLead = async (req, res) => {
    const { assignedsalerep } = req.body;
    try {
      const lead = await Lead.findByIdAndUpdate(
        req.params.id,
        { assignedsalerep },
        { new: true }
      );
      if (!lead) return res.status(404).json({ message: 'Lead not found' });
         
        return httpResponse.SUCCESS(res, lead, "Lead assigned successfully");
    } catch (err) {
        return httpResponse.BAD_REQUEST(res, err.message);
    }
  };
    export default {
        createLead,
        getLeads,
        getLeadById,
        updateLead,
        deleteLead,
        assignLead
    }