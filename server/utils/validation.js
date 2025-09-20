import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const examSchema = Joi.object({
  name: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Exam name must be at least 3 characters long',
    'string.max': 'Exam name cannot exceed 200 characters',
    'any.required': 'Exam name is required'
  }),
  category: Joi.string().valid(
    'Engineering', 'Medical', 'Civil Services', 'Banking', 'Railways',
    'Defence', 'Teaching', 'State Services', 'School Board', 'Law',
    'Management', 'Other'
  ).required().messages({
    'any.only': 'Please select a valid category',
    'any.required': 'Category is required'
  }),
  description: Joi.string().min(10).max(2000).required().messages({
    'string.min': 'Description must be at least 10 characters long',
    'string.max': 'Description cannot exceed 2000 characters',
    'any.required': 'Description is required'
  }),
  registrationStartDate: Joi.date().required().messages({
    'any.required': 'Registration start date is required'
  }),
  registrationEndDate: Joi.date().greater(Joi.ref('registrationStartDate')).required().messages({
    'date.greater': 'Registration end date must be after start date',
    'any.required': 'Registration end date is required'
  }),
  examDate: Joi.date().optional(),
  resultDate: Joi.date().optional(),
  answerKeyDate: Joi.date().optional(),
  websiteUrl: Joi.string().uri().required().messages({
    'string.uri': 'Please enter a valid website URL',
    'any.required': 'Website URL is required'
  }),
  eligibility: Joi.string().max(1000).optional().messages({
    'string.max': 'Eligibility cannot exceed 1000 characters'
  }),
  applicationFee: Joi.string().max(500).optional().messages({
    'string.max': 'Application fee cannot exceed 500 characters'
  })
});

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};