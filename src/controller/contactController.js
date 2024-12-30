import Contact from "../models/Contact/contactModel.js";
import { validateContact } from "../validations/contactValidation.js";
import { httpResponse } from "../utils/httpResponse.js";
import { fetchContactsByRole } from "../utils/fetchContactByRole.js";

// CREATE Contact
const createContact = async (req, res) => {
  const { name, email, phone, address, company, tags, created_by } = req.body;
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
      created_by
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
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      //req.body
      { name, email, phone, address, company, tags },
      {
        new: true,
        runValidators: true,
      }
    );
    return httpResponse.SUCCESS(res, updatedContact, "Contact Updated Successfully");
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err);
  }
};
// DELETE Contact
const deleteContact = async (req, res) => {
  try {

    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    if(!deletedContact) return httpResponse.NOT_FOUND(res, null, "contact not found")
    return httpResponse.SUCCESS(res, deletedContact, "Contact Deleted Successfully");
  } catch (err) {
    return httpResponse.BAD_REQUEST(res, err);
  }
};
export default {
    createContact,
    getAllContacts,
    updateContact,
    deleteContact
}

