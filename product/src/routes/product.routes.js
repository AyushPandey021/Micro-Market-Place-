import express from "express";
import multer from 'multer';
import { createProduct } from '../controllers/productController.js';
import createAuthMiddleware from "../middleware/auth.middleware.js";
import { validateCreateProduct } from "../middleware/validation.middleware.js";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 10 // Maximum 10 files
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// POST /api/products
router.post('/', createAuthMiddleware(['admin', 'seller']), upload.array('Images', 10), validateCreateProduct, createProduct);

export default router;