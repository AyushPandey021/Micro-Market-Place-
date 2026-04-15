import { body, validationResult } from "express-validator";

const responseWithValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();

}

const registerValidationRules = () => {
    return [
        body('username').notEmpty().withMessage('Username is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('fullName.firstName').optional().notEmpty().withMessage('First name is required'),
        body('fullName.lastName').optional().notEmpty().withMessage('Last name is required'),
        body('firstName').optional().notEmpty().withMessage('First name is required'),
        body('lastName').optional().notEmpty().withMessage('Last name is required'),
        body('role').optional().isIn(['user', 'seller']).withMessage('Role must be either user or seller'),
        body().custom((_, { req }) => {
            const firstName = req.body.fullName?.firstName || req.body.firstName;
            const lastName = req.body.fullName?.lastName || req.body.lastName;

            if (!firstName || !lastName) {
                throw new Error('First name and last name are required');
            }
            return true;
        }),
        responseWithValidationErrors
    ];
}

const loginValidationRules = () => {
    return [
        body('username').notEmpty().withMessage('Username is required'),
        body('password').notEmpty().withMessage('Password is required'),
        responseWithValidationErrors
    ];
}

const addUserAddressValidationRules = () => {
    return [
        body('street').notEmpty().withMessage('Street is required'),
        body('city').notEmpty().withMessage('City is required'),
        body('state').notEmpty().withMessage('State is required'),
        body('zip').notEmpty().withMessage('Zip code is required'),
        body('country').notEmpty().withMessage('Country is required'),
        responseWithValidationErrors
    ];
}

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export default { registerValidationRules, loginValidationRules, validate, addUserAddressValidationRules };
