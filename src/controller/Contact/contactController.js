import Contact from "../../models/Contact/contactModel.js";
import { validateContact } from "../../validations/contactValidation.js";
import { httpResponse } from "../../utils/index.js";
import {
  fetchContactsByRole,
  updateContactByRole,
  deleteContactByRole,
  fetchContactsByIdRole,
} from "../../utils/Contact/contactHelper.js";
import sendMail from "../../nodemailer/nodemailerIntegration.js";
import { contactAssignEmailTemplate } from "../../nodemailer/emailTemplate.js";
import ContactAssignment from "../../models/Contact/assignContactModel.js";
// CREATE Contact
const createContact = async (req, res) => {
  const { name, email, phone, address, company, tags } = req.body;
  const { error } = validateContact(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const newContact = new Contact({
      name,
      email,
      phone,
      address,
      company,
      tags,
      created_by: req.user._id,
    });
    await newContact.save();
    return httpResponse.CREATED(
      res,
      newContact,
      "Contact Created Successfully"
    );
  } catch (err) {
    console.log(err.message);
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};


// READ Contacts on base of role
const getAllContacts = async (req, res) => {
  try {
    const { role, _id } = req.user;
    return await fetchContactsByRole(role, _id, res);
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

//get contact by id
const getContactById = async (req, res) => {
  try {
    const id = req.params.id;
    const { role, _id: userId } = req.user;
    return fetchContactsByIdRole(role, userId, id, res);
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};
// UPDATE Contact
const updateContact = async (req, res) => {
  const id = req.params.id;
  const { name, email, phone, address, company, tags, salerep_Ids } = req.body;
  const { _id: userId, role } = req.user;

  const updatedData = {
    name,
    email,
    phone,
    address,
    company,
    tags,
    updated_by: userId,
  };
  try {
    return await updateContactByRole(
      id,
      updatedData,
      userId,
      role,
      salerep_Ids,
      res
    );
  } catch (error) {
    return httpResponse.BAD_REQUEST(res, error.message);
  }
};

// DELETE Contact
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;
    await deleteContactByRole(id, userId, role, res);
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

const assignContact = async (req, res) => {
  const { _id } = req.user;
  const { salerep_ids } = req.body;
  const { id: contact_id } = req.params;

  try {
    const contactExists = await Contact.findById(contact_id);
    if (!contactExists) {
      return res.status(404).json({ message: "Contact not found" });
    }

    const existingAssignments = await ContactAssignment.find({
      contact_id,
      salerep_id: { $in: salerep_ids },
    });

    if (existingAssignments.length > 0) {
      return httpResponse.BAD_REQUEST(
        res,
        null,
        "This contact is already assigned to the provided SalesRep"
      );
    }

    const assignments = salerep_ids.map((salerep_id) => ({
      contact_id,
      salerep_id,
      assigned_by: _id,
    }));

    // Insert assignments
    await ContactAssignment.insertMany(assignments);

    // Fetch assigned sales reps with their email addresses
    const assignedReps = await ContactAssignment.find({ contact_id }).populate(
      "salerep_id",
      "name email"
    );

    // Send an email to each assigned sales representative
    // for (const rep of assignedReps) {
    //   const { name, email } = rep.salerep_id;

    //   // Call the sendMail function for each sales representative
    //   sendMail(
    //     email,
    //     "Contact Assignment Email",
    //     contactAssignEmailTemplate(name, contactExists.name)
    //   );
    // }

    return httpResponse.SUCCESS(
      res,
      assignedReps,
      "Contact assigned to sales representatives successfully"
    );
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

export default {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  assignContact,

};
