import express from "express";
import validatorMiddleware from "../middleware/validator.middleware.js";
import authController from "../controllers/authController.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/auth/register', validatorMiddleware.registerValidationRules(), authController.register);
router.post('/auth/login', validatorMiddleware.loginValidationRules(), authController.login);
router.get('/auth/me', authMiddleware, authController.getCurrentUser);
router.get('/auth/users/me/address', authMiddleware, authController.getUserAddresses);
router.post('/auth/users/me/address', authMiddleware, validatorMiddleware.addUserAddressValidationRules(), authController.addUserAddress);
router.delete('/auth/users/me/address/:addressid', authMiddleware, authController.deleteUserAddress);
router.post('/auth/logout', authMiddleware, authController.logout);

export default router;
