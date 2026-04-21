const logger = require('../utils/logger.js');
const { detectIntent, generateMessage } = require('../utils/ai.js');
const { parseShoppingQuery } = require('../utils/parseShoppingQuery.js');


const STOPWORDS = new Set([
    'find', 'show', 'give', 'me', 'i', 'want', 'please', 'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with'
]);

/**
 * Main AI shopping assistant - EXACT task spec JSON output
 * Handles normalization, filters, tool_call
 */
export const processAIQuery = async (query, token) => {
    try {
        logger.info({ query }, 'AI shopping assistant processing');

        if (!query || query.trim().length === 0) {
            return {
                intent: 'clarification',
                raw_query: '',
                normalized_query: '',
                filters: {},
                tool_call: { name: '', arguments: {} },
                message: 'Please provide a shopping query.'
            };
        }

        // 1. Intent
        const intent = detectIntent(query);

        // 2. Raw 
        const raw_query = query.trim();

        // 3. Parse filters (search only)
        const parseResult = intent === 'search' ? parseShoppingQuery(raw_query) : { normalized_query: '', filters: {} };
        const normalized_query = intent === 'search' ? parseResult.normalized_query : '';
        const filters = parseResult.filters;


        // 4. Build tool_call
        const tool_call = { name: '', arguments: {} };
        let message = '';

        if (intent === 'search') {
            tool_call.name = 'search_products';
            tool_call.arguments = filters; // exact filters match task examples
            message = generateMessage(intent, filters);
        } else if (intent === 'add_to_cart') {
            tool_call.name = 'add_to_cart';
            tool_call.arguments = {}; // Frontend fills product_id, quantity
            message = generateMessage(intent);
        } else if (intent === 'create_cart') {
            tool_call.name = 'create_cart';
            tool_call.arguments = {};
            message = generateMessage(intent);
        } else {
            message = generateMessage(intent);
        }


        const result = {
            intent,
            raw_query,
            normalized_query: intent === 'search' ? normalized_query : '',
            filters: intent === 'search' ? filters : {},
            tool_call,
            message
        };

        logger.info({ result }, 'AI shopping assistant response');
        return result;

    } catch (error) {
        logger.error({ query, error: error.message }, 'AI processor error');
        return {
            intent: 'clarification',
            raw_query: query || '',
            normalized_query: '',
            filters: {},
            tool_call: { name: '', arguments: {} },
            message: 'Sorry, processing error. Please try again.'
        };
    }
};

