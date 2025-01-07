import Joi from "joi";

// Joi validation schema
export const validateNote = (data) => {
    const schema = Joi.object({
        note: Joi.string().required(),
        note_type: Joi.string()
            .valid("Contact", "Lead", "Activity") 
            .required(),
        note_to: Joi.string().required(),
        note_by: Joi.string().optional(), 
    });

    return schema.validate(data); 
};