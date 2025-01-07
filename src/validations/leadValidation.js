import Joi from 'joi'; // ES module syntax

// Define the validation function
export const validateLead = (data) => {
  const leadSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    contactinfo: Joi.string().min(10).max(15).required(),
    leadsource: Joi.string().min(3).max(50).required(),
    status: Joi.string()
      .valid("New", "Contacted", "Qualified", "Lost")
      .required(),
      created_by: Joi.string(),
  });

  // Validate the data
  return leadSchema.validate(data);
};

