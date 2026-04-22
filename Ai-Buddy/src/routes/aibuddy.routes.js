import express from 'express';
import * as controller from '../controllers/aibuddy.controller.js';
import { verifyToken, optionalVerifyToken } from '../middleware/auth.middleware.js';
import {
    validateQueryRequest,
    validateAddToCartRequest,
    validateAddSingleProductRequest,
} from '../middleware/validation.middleware.js';

const router = express.Router();

/**
 * @route   POST /ai-buddy/process
 * @desc    AI Buddy main processing endpoint (SPEC)
 * @access  Private
 * @returns Structured JSON response per spec
 */
router.post('/process', optionalVerifyToken, validateQueryRequest, controller.processQuery);

/**
 * @route   POST /ai-buddy/ask
 * @desc    Ask AI buddy - process natural language query and optionally add to cart
 * @access  Private
 * @param   {string} query - Natural language query (e.g., "Find me red sneakers under ₹2000")
 * @param   {boolean} autoAddToCart - Optional: auto-add top product to cart
 * @returns {Object} Search results with natural language response (legacy)
 */
router.post('/ask', verifyToken, validateQueryRequest, controller.askBuddy);


/**
 * @route   POST /ai-buddy/search
 * @desc    Search for products using natural language
 * @access  Private
 * @param   {string} query - Search query
 * @returns {Object} Product search results
 */
router.post('/search', verifyToken, validateQueryRequest, controller.searchProducts);

/**
 * @route   POST /ai-buddy/cart/add
 * @desc    Add multiple products to cart
 * @access  Private
 * @param   {array} productIds - Array of product IDs
 * @param   {object} quantities - Optional: quantities for each product
 * @returns {Object} Cart update result
 */
router.post('/cart/add', verifyToken, validateAddToCartRequest, controller.addToCart);

/**
 * @route   POST /ai-buddy/cart/add-single
 * @desc    Add single product to cart
 * @access  Private
 * @param   {string} productId - Product ID
 * @param   {number} quantity - Quantity (default: 1)
 * @returns {Object} Cart update result
 */
router.post('/cart/add-single', verifyToken, validateAddSingleProductRequest, controller.addSingleToCart);

/**
 * @route   POST /ai-buddy/tools/search_products
 * @desc    Tool endpoint for search_products
 * @access  Private
 */
router.post('/tools/search_products', verifyToken, controller.searchProducts);

/**
 * @route   POST /ai-buddy/tools/add_to_cart
 * @desc    Tool endpoint for add_to_cart
 * @access  Private
 */
router.post('/tools/add_to_cart', verifyToken, validateAddSingleProductRequest, controller.addSingleToCart);

/**
 * @route   POST /ai-buddy/tools/create_cart
 * @desc    Tool endpoint for create_cart
 * @access  Private
 */
router.post('/tools/create_cart', verifyToken, controller.getCart); // create_cart → getCart for now


/**
 * @route   GET /ai-buddy/cart
 * @desc    Get current cart status
 * @access  Private
 * @returns {Object} Cart details
 */
router.get('/cart', verifyToken, controller.getCart);

/**
 * @route   POST /ai-buddy/parse
 * @desc    Parse natural language query (for testing/debugging)
 * @access  Optional Auth
 * @param   {string} query - Query to parse
 * @returns {Object} Extracted filters and keywords
 */
router.post('/parse', optionalVerifyToken, controller.parseQuery);

export default router;
