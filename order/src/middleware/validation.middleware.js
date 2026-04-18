import { body, param, validationResult } from 'express-validator';

// Validation middleware for creating an order
export const validateCreateOrder = [
    body('shippingAddress.street')
        .isString()
        .notEmpty()
        .withMessage('Street is required'),

    body('shippingAddress.city')
        .isString()
        .notEmpty()
        .withMessage('City is required'),

    body('shippingAddress.state')
        .isString()
        .notEmpty()
        .withMessage('State is required'),

    body('shippingAddress.country')
        .isString()
        .notEmpty()
        .withMessage('Country is required'),

    body('shippingAddress.zipCode')
        .isString()
        .notEmpty()
        .withMessage('Zip code is required'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

// Validation for updating address
export const validateUpdateAddress = [
    body('shippingAddress.street')
        .isString()
        .notEmpty()
        .withMessage('Street is required'),

    body('shippingAddress.city')
        .isString()
        .notEmpty()
        .withMessage('City is required'),

    body('shippingAddress.state')
        .isString()
        .notEmpty()
        .withMessage('State is required'),

    body('shippingAddress.country')
        .isString()
        .notEmpty()
        .withMessage('Country is required'),

    body('shippingAddress.zipCode')
        .isString()
        .notEmpty()
        .withMessage('Zip code is required'),

    param('id')
        .isString()
        .notEmpty()
        .withMessage('Order ID is required'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

// Validation for cancel order
export const validateCancelOrder = [
    param('id')
        .isUUID()
        .withMessage('Invalid order ID'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

// Validation for getting an order by ID
export const validateGetOrder = [
    param('id')
        .isString()
        .notEmpty()
        .withMessage('Order ID is required'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];


// Validation for get order by id
