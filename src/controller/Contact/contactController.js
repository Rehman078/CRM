import Contact from "../../models/Contact/contactModel.js";
import { validateContact } from "../../validations/contactValidation.js";
import { httpResponse } from "../../utils/index.js";
import { fetchContactsByRole } from "../../utils/Contact/fetchContactByRole.js";
import { deleteContactByRole } from "../../utils/Contact/deleteContactByRole.js";
import { updateContactByRole } from "../../utils/Contact/updateContactByRole.js";
import Assignment from "../../models/Contact/assignContactModel.js";
// CREATE Contact
const createContact = async (req, res) => {
  const { name, email, phone, address, company, tags} = req.body;
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
      created_by : req.user._id
    });
    await newContact.save();
    return httpResponse.CREATED(res, newContact, "Contact Created Successfully");
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err);
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

// UPDATE Contact


const updateContact = async (req, res) => {
  const id = req.params.id;
  const { name, email, phone, address, company, tags, salerep_Ids } = req.body;
  const { _id: userId, role } = req.user;
  
  const updatedData = { name, email, phone, address, company, tags, updated_by: userId };
  try {
    return await updateContactByRole(id, updatedData, userId, role, salerep_Ids, res);
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

//asigned salerep

const assignContact = async (req, res) => {
  const { _id } = req.user; 
  const { salerep_ids } = req.body; 
  const { id: contact_id } = req.params;

  try {
    const contactExists = await Contact.findById(contact_id);
    console.log(contactExists);
    if (!contactExists) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Create assignments for each SaleRep
    const assignments = salerep_ids.map((salerep_id) => ({
      contact_id,
      salerep_id,
      assigned_by: _id,
    }));

    // Save the assignments in bulk
    await Assignment.insertMany(assignments);
    // Optionally, fetch the updated data for response
    const assignedReps = await Assignment.find({ contact_id }).populate('salerep_id');

    return httpResponse.SUCCESS(res, assignedReps, "Contact assigned to sales representatives successfully");
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

export default {
    createContact,
    getAllContacts,
    updateContact,
    deleteContact,
    assignContact

}

