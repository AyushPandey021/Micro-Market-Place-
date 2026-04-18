import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
} from '../controllers/cartController.js';
import createAuthMiddleware from '../middleware/auth.middleware.js';
import {
    validateAddToCart,
    validateUpdateQuantity
} from '../middleware/validation.middleware.js';

const router = express.Router();

const authUser = createAuthMiddleware(['user', 'admin', 'seller']);

router.get('/', authUser, getCart);
router.post('/items', authUser, validateAddToCart, addToCart);
router.patch('/items/:productId', authUser, validateUpdateQuantity, updateCartItem);
router.delete('/items/:productId', authUser, removeCartItem);
router.delete('/', authUser, clearCart);

export default router;