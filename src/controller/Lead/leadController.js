import Lead from "../../models/Lead/leadModel.js";
import LeadAsignment from "../../models/Lead/assignLeadModel.js";
import { httpResponse } from "../../utils/index.js";
import { validateLead } from "../../validations/leadValidation.js";
import sendMail from "../../nodemailer/nodemailerIntegration.js";
import { leadAssignEmailTemplate } from "../../nodemailer/emailTemplate.js";
import {
  fetchLeadsByRole,
  getLeadsById,
  updateLeadByRole,
  deleteLeadById,
} from "../../utils/Lead/leadHelper.js";
//create lead
const createLead = async (req, res) => {
  try {
    const {
      name,
      contactinfo,
      leadsource,
      assignedsalerep,
      status,
      created_by,
    } = req.body;
    const { error } = validateLead(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const lead = new Lead({
      name,
      contactinfo,
      leadsource,
      assignedsalerep,
      status,
      created_by: created_by || req.user._id,
    });
    await lead.save();
    return httpResponse.SUCCESS(res, lead, "Lead created successfully");
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

//get all leads
const getLeads = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    await fetchLeadsByRole(role, userId, res);
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

//get lead by id
const getLeadById = async (req, res) => {
  try {
    const id = req.params.id;
    const { role, _id: userId } = req.user;
    return await getLeadsById(id, userId, role, res);
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

//update lead
const updateLead = async (req, res) => {
  const { name, contactinfo, leadsource, status, salerep_Ids } = req.body;
  try {
    const id = req.params.id;
    const { role, _id: userId } = req.user;

    const updatedData = {
      name,
      contactinfo,
      leadsource,
      status,
      updated_by: userId,
    };
    return await updateLeadByRole(
      id,
      updatedData,
      userId,
      role,
      salerep_Ids,
      res
    );
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
  const { _id } = req.user;
  const { salerep_ids } = req.body;
  const { id: lead_id } = req.params;

  try {
    const leadExists = await Lead.findById(lead_id);
    if (!leadExists) {
      return res.status(404).json({ message: "Lead not found" });
    }
    const existingAssignments = await LeadAsignment.find({
      lead_id,
      salerep_id: { $in: salerep_ids },
    });

    if (existingAssignments.length > 0) {
      return httpResponse.BAD_REQUEST(
        res,
        null,
        "This lead is already assigned to the provided SalesRep"
      );
    }
    // Create assignments for each SaleRep
    const assignments = salerep_ids.map((salerep_id) => ({
      lead_id,
      salerep_id,
      assigned_by: _id,
    }));

    await LeadAsignment.insertMany(assignments);
    // Fetch assigned sales reps with their email addresses
    const assignedReps = await LeadAsignment.find({ lead_id }).populate("salerep_id", "name email");
      
    // Send an email to each assigned sales representative
    for (const rep of assignedReps) {
      const { name, email } = rep.salerep_id;
      
      // Call the sendMail function for each sales representative
      sendMail(
        email,
        "Lead Assignment Email",
        leadAssignEmailTemplate(name, leadExists.name)
      );
    }
    return httpResponse.SUCCESS(
      res,
      assignedReps,
      "lead assigned to sales representatives successfully"
    );
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

//update status
const updateStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { role, _id: userId } = req.user;
    const { status } = req.body;

    const updatedData = { status, updated_by: userId };
    return await updateLeadByRole(id, updatedData, userId, role, res);
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
  assignLead,
  updateStatus,
};
