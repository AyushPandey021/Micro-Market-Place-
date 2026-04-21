const { ShoppingFiltersSchema } = require('../types/shoppingFilters.js');
const logger = require('./logger.js');


const NORMALIZATIONS = {
    "mens": "men",
    "womens": "women",
    "kid's": "kids",
    // Add more mappings as needed
};

const STOPWORDS = new Set([
    'find', 'show', 'give', 'me', 'i', 'want', 'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with'
]);

const COLORS = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown', 'gray', 'grey', 'silver', 'gold'];


const BRANDS = ['nike', 'adidas', 'puma', 'gucci', 'levis', 'rayban', 'casio', 'titan', 'fossil', 'reebok', 'zara'];

export const parseShoppingQuery = (query) => {
    try {
        let normalized = query.toLowerCase().trim().replace(/['’]/g, '');

        // Apply mappings
        Object.entries(NORMALIZATIONS).forEach(([from, to]) => {
            normalized = normalized.replace(new RegExp(from, 'g'), to);
        });

        const words = normalized.split(/\s+/).filter(w => w.length > 1);


        // Extract keywords (non-stopwords)
        const keywords = words.filter(word => !STOPWORDS.has(word));

        const filters = {
            keywords: keywords.length > 0 ? keywords.slice(0, 5) : [], // limit
        };


        // price_max
        const priceMatch = normalized.match(/(?:under|below|max)\\s*([0-9,]+k?)/i);
        if (priceMatch) {
            let price = parseFloat(priceMatch[1].replace(/,/g, ''));
            if (priceMatch[1].includes('k')) price *= 1000;
            filters.price_max = Math.round(price);
        }



        // Filter out empty values
        Object.keys(filters).forEach(key => {
            if (!filters[key]) delete filters[key];
        });

        const normalized_query = normalized;
        logger.debug({ originalQuery: query, normalized_query, normalized, filters }, 'Shopping query parsed');
        return {
            normalized_query,
            filters: ShoppingFiltersSchema.parse(filters)
        };

    } catch (error) {
        logger.error({ query, error }, 'parseShoppingQuery failed');
        return {
            normalized_query: '',
            filters: { keywords: [] }
        };

    }
};

