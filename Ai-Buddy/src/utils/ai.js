const logger = require('./logger.js');


/**
 * Improved intent detection matching task spec
 * "search" | "add_to_cart" | "create_cart" | "clarification"
 */
export const detectIntent = (query) => {
    const lowerQuery = query.toLowerCase().trim();

    // Add to cart patterns
    if (lowerQuery.match(/(?:add|put)\\s+(?:to|in)?\\s+cart|buy now|purchase/i)) {
        return 'add_to_cart';
    }

    // Create cart patterns
    if (lowerQuery.match(/create (?:new )?cart|(?:new|start|empty) (?:shopping )?cart|begin shopping/i)) {
        return 'create_cart';
    }

    // Clarification/help
    if (lowerQuery.match(/what|how|help|explain|clarify|\\?|who are you|what can you do/i)) {
        return 'clarification';
    }

    // Default search
    return 'search';
};

/**
 * Generate response message based on intent and filters
 */
export const generateMessage = (intent, filters = {}) => {
    switch (intent) {
        case 'search':
            let msg = 'Searching';
            if (filters.keywords?.length) {
                msg += ` for ${filters.keywords.join(' ')}`;
            }
            if (filters.price_max) msg += ` under ${filters.price_max}`;
            msg += '';
            return msg;

        case 'add_to_cart':
            return 'Adding to cart. Please confirm product and quantity.';

        case 'create_cart':
            return 'Creating new shopping cart.';

        case 'clarification':
            return 'Could you clarify? Tell me what you need.';

        default:
            return 'Processing your request...';
    }
};




