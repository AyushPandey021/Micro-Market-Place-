import logger from '../utils/logger.js';
import * as aiProcessor from '../services/aiProcessor.js';
import * as aiBuddyService from '../services/aibuddy.service.js';


/**
 * POST /process - AI Buddy process query (NEW SPEC ENDPOINT)
 */
export const processQuery = async (req, res) => {
    try {
        const { query } = req.body;
        const token = req.token;

        logger.info({ query, token: !!token }, 'AI Buddy processQuery called');

        if (!query) {
            return res.status(400).json({
                intent: 'clarification',
                filters: {},
                tool_call: { name: '', arguments: {} },
                message: 'Please provide a query.'
            });
        }

        const result = await aiProcessor.processAIQuery(query, token);

        res.status(200).json(result);
    } catch (error) {
        logger.error(error, 'Error in processQuery controller');
        res.status(500).json({
            intent: 'clarification',
            filters: {},
            tool_call: { name: '', arguments: {} },
            message: 'Internal server error. Please try again.',
        });
    }
};

/**
 * POST /ask - Process natural language query (legacy - redirect to /process)
 */
export const askBuddy = async (req, res) => {
    try {
        const { query } = req.body;
        const token = req.token;

        logger.warn('Legacy /ask endpoint used - redirecting to /process');

        const result = await aiProcessor.processAIQuery(query, token);

        res.status(200).json(result);
    } catch (error) {
        logger.error(error, 'Error in askBuddy controller');
        res.status(500).json({
            intent: 'clarification',
            filters: {},
            tool_call: { name: '', arguments: {} },
            message: 'Internal server error. Please try again.',
        });
    }
};


/**
 * POST /search - Search for products
 */
export const searchProducts = async (req, res) => {
    try {
        const { query } = req.body;
        const token = req.token;

        logger.info({ query }, 'Search products endpoint called');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required for this operation',
            });
        }

        const result = await aiBuddyService.processUserQuery(query, token);

        res.status(200).json(result);
    } catch (error) {
        logger.error(error, 'Error in searchProducts controller');
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

/**
 * POST /cart/add - Add products to cart
 */
export const addToCart = async (req, res) => {
    try {
        const { productIds, quantities } = req.body;
        const token = req.token;

        logger.info({ productIds }, 'Add to cart endpoint called');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required for this operation',
            });
        }

        const result = await aiBuddyService.addProductsToCart(productIds, quantities || {}, token);

        res.status(200).json(result);
    } catch (error) {
        logger.error(error, 'Error in addToCart controller');
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

/**
 * POST /cart/add-single - Add single product to cart
 */
export const addSingleToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const token = req.token;

        logger.info({ productId, quantity }, 'Add single product to cart endpoint called');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required for this operation',
            });
        }

        const result = await aiBuddyService.addSingleProductToCart(
            productId,
            quantity || 1,
            token
        );

        res.status(200).json(result);
    } catch (error) {
        logger.error(error, 'Error in addSingleToCart controller');
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

/**
 * GET /cart - Get cart status
 */
export const getCart = async (req, res) => {
    try {
        const token = req.token;

        logger.debug('Get cart endpoint called');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required for this operation',
            });
        }

        const result = await aiBuddyService.getCartStatus(token);

        res.status(200).json(result);
    } catch (error) {
        logger.error(error, 'Error in getCart controller');
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

/**
 * POST /parse - Parse query and return extracted filters (for testing)
 */
export const parseQuery = async (req, res) => {
    try {
        const { query } = req.body;

        logger.info({ query }, 'Parse query endpoint called');

        const { parseQuery: parseQueryUtil } = await import('../utils/nlp.js');
        const filters = parseQueryUtil(query);

        res.status(200).json({
            success: true,
            query,
            filters,
        });
    } catch (error) {
        logger.error(error, 'Error in parseQuery controller');
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};
