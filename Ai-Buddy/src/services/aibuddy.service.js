import logger from '../utils/logger.js';


import { parseQueryWithAI, generateMessage } from '../utils/ai.js';
import * as productService from './productService.js';
import * as cartService from './cartService.js';

/**
 * Process natural language query
 */
export const processUserQuery = async (query, token) => {
    try {
        logger.info({ query }, 'Processing AI query');

        // AI parse
        const filters = await parseQueryWithAI(query);

        if (!filters.keywords || filters.keywords.length === 0) {
            return {
                success: false,
                message: 'Could not extract search terms from your query.',
            };
        }

        // Build search query
        const searchParams = {
            q: filters.keywords.join(' '),
            category: filters.category,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            color: filters.color,
            sort: filters.sortBy,
            limit: filters.limit,
        };

        // Search products
        const searchResults = await productService.searchProducts(searchParams, token);

        const products = searchResults.data || searchResults || [];
        const totalCount = searchResults.totalCount || products.length;

        // AI response
        const message = await generateResponseWithAI(query, products);

        return {
            success: true,
            message,
            products,
            totalCount,
            filters,
        };
    } catch (error) {
        logger.error({ error: error.message, query }, 'Error processing AI query');
        return {
            success: false,
            message: 'AI processing failed. Please try again.',
            error: error.message,
        };
    }
};

/**
 * Add recommended products to cart
 */
export const addProductsToCart = async (productIds, quantities = {}, token) => {
    try {
        logger.info({ productIds }, 'Adding products to cart');

        const items = productIds.map(productId => ({
            productId,
            quantity: quantities[productId] || 1,
        }));

        const results = await cartService.addMultipleToCart(items, token);

        return {
            success: true,
            message: `Successfully added ${items.length} item(s) to your cart!`,
            items: results,
        };
    } catch (error) {
        logger.error({ error: error.message, productIds }, 'Error adding products to cart');
        return {
            success: false,
            message: 'Failed to add items to cart. Please try again.',
            error: error.message,
        };
    }
};

/**
 * Add single product to cart with quantity
 */
export const addSingleProductToCart = async (productId, quantity = 1, token) => {
    try {
        logger.info({ productId, quantity }, 'Adding single product to cart');

        const result = await cartService.addToCart(productId, quantity, token);

        return {
            success: true,
            message: `Added ${quantity} item(s) to your cart!`,
            cart: result,
        };
    } catch (error) {
        logger.error({ error: error.message, productId, quantity }, 'Error adding single product to cart');
        return {
            success: false,
            message: 'Failed to add item to cart. Please try again.',
            error: error.message,
        };
    }
};

/**
 * Smart shopping assistant - Parse, Search, and Add to Cart
 */
export const smartShoppingAssistant = async (query, autoAddToCart = false, token) => {
    try {
        logger.info({ query, autoAddToCart }, 'Smart shopping assistant initiated');

        // Step 1: Process the query
        const queryResult = await processUserQuery(query, token);

        if (!queryResult.success || !queryResult.products || queryResult.products.length === 0) {
            return queryResult;
        }

        // Step 2: If autoAddToCart is true, add top products to cart
        if (autoAddToCart && queryResult.products.length > 0) {
            const topProduct = queryResult.products[0];
            const cartResult = await addSingleProductToCart(topProduct._id || topProduct.id, 1, token);

            return {
                ...queryResult,
                cartAction: cartResult,
                autoAddedToCart: true,
            };
        }

        return queryResult;
    } catch (error) {
        logger.error({ error: error.message, query }, 'Error in smart shopping assistant');
        return {
            success: false,
            message: 'An error occurred. Please try again.',
            error: error.message,
        };
    }
};

/**
 * Get cart status
 */
export const getCartStatus = async (token) => {
    try {
        logger.debug('Fetching cart status');
        const cart = await cartService.getCart(token);
        return {
            success: true,
            cart,
        };
    } catch (error) {
        logger.error({ error: error.message }, 'Error fetching cart status');
        return {
            success: false,
            message: 'Failed to fetch cart status',
            error: error.message,
        };
    }
};
