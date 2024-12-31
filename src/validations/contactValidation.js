import Joi from "joi";

export const validateContact = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).max(15).required(),
    address: Joi.string().max(255).required(),
    company: Joi.string().max(100).required(),
    tags: Joi.array().required(),
    created_by: Joi.string(),
  });
  return schema.validate(data);
};
