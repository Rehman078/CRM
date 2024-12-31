import Contact from "../../models/Contact/contactModel.js";
import { validateContact } from "../../validations/contactValidation.js";
import { httpResponse } from "../../utils/index.js";
import { fetchContactsByRole } from "../../utils/Contact/fetchContactByRole.js";
import { deleteContactByRole } from "../../utils/Contact/deleteContactByRole.js";
import { updateContactByRole } from "../../utils/Contact/updateContactByRole.js";
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
    const { role, _id: userId } = req.user; 
    const contacts = await fetchContactsByRole(role, userId);

    return httpResponse.SUCCESS(res, contacts, "Contacts retrieved successfully");
  } catch (err) {
    if (err.message === "Not authorized to view contacts") {
      return httpResponse.FORBIDDEN(res, null, err.message);
    }
    return httpResponse.BAD_REQUEST(res, err, "Failed to retrieve contacts");
  }
};

// UPDATE Contact
const updateContact = async (req, res) => {
  const { name, email, phone, address, company, tags } = req.body;
  const { error } = validateContact(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
   const id = req.params.id;
       const { role, _id: userId } = req.user;
       const updatedData = { name, email, phone, address, company, tags };
       return await updateContactByRole(id, updatedData, userId, role, res);;
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};
// DELETE Contact
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    // Pass the response object to deleteContactByRole
    await deleteContactByRole(id, userId, role, res);
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err.message);
  }
};

export default {
    createContact,
    getAllContacts,
    updateContact,
    deleteContact
}

