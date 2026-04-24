import logger from './logger.js';

/**
 * Intent Detection
 * "search" | "add_to_cart" | "create_cart" | "clarification"
 */
export const detectIntent = (query) => {
    const lowerQuery = query.toLowerCase().trim();

    // 🔥 normalize
    const normalized = lowerQuery.replace(/['’]/g, "");

    // 🛒 Add to cart — only if query has a specific product descriptor
    if (/(add|put).*(cart)|buy|purchase/.test(normalized)) {
        const genericProductWords = ['product', 'item', 'thing', 'something', 'anything', 'stuff', 'object', 'goods'];
        const words = normalized.split(/\s+/);
        const specificWords = words.filter(
            w => w.length > 2 && !['add', 'put', 'cart', 'buy', 'purchase', 'to', 'in', 'into', 'a', 'an', 'the', 'my'].includes(w) && !genericProductWords.includes(w)
        );
        if (specificWords.length > 0) {
            return 'add_to_cart';
        }
    }

    // 🛍 Create cart
    if (/(create|new|start|empty).*(cart)/.test(normalized)) {
        return 'create_cart';
    }

    // ❗ Clarification (ONLY question-type)
    if (
        normalized.includes("?") ||
        normalized.startsWith("what") ||
        normalized.startsWith("how") ||
        normalized.startsWith("help") ||
        normalized.startsWith("why")
    ) {
        return 'clarification';
    }

    // 🔥 DEFAULT → SEARCH
    return 'search';
};

/**
 * Generate response message
 */
export const generateMessage = (intent, filters = {}) => {
    switch (intent) {
        case 'search': {
            let msg = 'Searching';

            if (filters.keywords?.length) {
                msg += ` for ${filters.keywords.join(' ')}`;
            }

            if (filters.price_max) {
                msg += ` under ₹${filters.price_max}`;
            }

            msg += '...';
            return msg;
        }

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

export const parseQueryWithAI = (query) => {
    const intent = detectIntent(query);

    // 🔥 normalize
    const normalized = query
        .toLowerCase()
        .replace(/['’]/g, "")
        .replace("mens", "men");

    // 🔥 keyword extraction
    const keywords = normalized.split(" ").filter(Boolean);

    return {
        intent,
        raw_query: query,
        normalized_query: normalized,
        filters: {
            keywords
        },
        tool_call: {
            name: intent === "search" ? "search_products" : "",
            arguments: {
                keywords
            }
        },
        message: generateMessage(intent, { keywords })
    };
};