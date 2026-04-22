

import logger from './logger.js';
import { ShoppingFiltersSchema } from '../types/shoppingFilters.js';

const NORMALIZATIONS = {
    "mens": "men",
    "womens": "women",
    "kids": "kids",
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
        const keywords = Array.isArray(words) ? words.filter(word => typeof word === 'string' && !STOPWORDS.has(word)).slice(0, 5) : [];


        const filters = {
            keywords: Array.isArray(keywords) && keywords.length > 0 ? keywords.slice(0, 5) : [], // limit
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

        const normalized_query = keywords.join(' ');
        logger.debug({ originalQuery: query, normalized_query, keywords, filters }, 'Shopping query parsed');
        return {
            normalized_query,
            filters
        };


    } catch (error) {
        logger.error({ query, error }, 'parseShoppingQuery failed');
        return {
            normalized_query: '',
            filters: { keywords: [] }
        };

    }
};

