import { body, validationResult } from 'express-validator';

// Validation middleware for creating a product
export const validateCreateProduct = [
    body('title')
        .isString()
        .notEmpty()
        .withMessage('Title is required'),

    body('description')
        .optional()
        .isString(),

    body('priceAmount')
        .isNumeric()
        .withMessage('Price is required')
        .isFloat({ min: 0 }),

    body('priceCurrency')
        .optional()
        .isString(),

    body('seller')
        .optional()
        .isMongoId()
        .withMessage('Seller must be valid ID'),

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