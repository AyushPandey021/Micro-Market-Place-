import Groq from "groq-sdk";
import * as productLocal from './productLocal.service.js';
import logger from '../utils/logger.js';

// 🔥 Initialize Groq safely
let groq = null;

if (process.env.GROQ_API_KEY) {
    try {
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
        console.log("✅ Groq initialized");
    } catch (error) {
        logger.error('❌ Groq init failed:', error.message);
        groq = null;
    }
} else {
    logger.warn('⚠️ GROQ_API_KEY missing → fallback mode');
}

// 🔥 Strong prompt
const SYSTEM_PROMPT = `You are a shopping assistant.

RULES:
- Always treat user query as PRODUCT SEARCH
- NEVER ask clarification
- Extract ONLY keywords
- Normalize:
  - lowercase
  - remove apostrophes
  - mens → men

OUTPUT STRICT JSON:

{
  "intent": "search",
  "filters": {
    "keywords": ["men", "kurta"]
  }
}
`;

/**
 * 🔥 Normalize function (important)
 */
const normalizeQuery = (query) => {
    return query
        .toLowerCase()
        .replace(/['’]/g, "")
        .replace("mens", "men")
        .trim();
};

/**
 * 🔥 Fallback keyword extraction
 */
const extractKeywords = (query) => {
    return normalizeQuery(query)
        .split(" ")
        .filter(word => word.length > 2);
};

/**
 * 🚀 MAIN AI FUNCTION
 */
export const processAIQuery = async (query) => {
    try {
        console.log('🔵 AI Query:', query);

        if (!query || typeof query !== 'string') {
            return {
                products: [],
                message: 'Please enter a valid query.'
            };
        }

        let keywords = [];

        // =============================
        // 🧠 1. TRY GROQ AI
        // =============================
        if (groq) {
            try {
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: query }
                    ],
                    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
                    temperature: 0,
                    response_format: { type: 'json_object' }
                });

                const aiResponse = completion.choices[0]?.message?.content;
                console.log('🟢 AI Raw Response:', aiResponse);

                const parsed = JSON.parse(aiResponse);

                keywords = parsed?.filters?.keywords || [];

                if (!Array.isArray(keywords) || keywords.length === 0) {
                    throw new Error("Empty keywords from AI");
                }

            } catch (err) {
                console.log('⚠️ AI failed → fallback:', err.message);
                keywords = extractKeywords(query);
            }
        } else {
            // =============================
            // 🔄 2. FALLBACK (NO AI)
            // =============================
            keywords = extractKeywords(query);
        }

        console.log('🟡 Final Keywords:', keywords);

        // =============================
        // 🔍 3. SEARCH PRODUCTS
        // =============================
        const products = await productLocal.searchProducts(keywords);

        console.log('🟣 Products Found:', products.length);

        // =============================
        // 🧾 4. RESPONSE
        // =============================
        const cartKeywords = ['add', 'buy', 'cart', 'purchase'];
        const hasCartIntent = keywords.some(kw => cartKeywords.includes(kw));

        // 🔒 Prevent auto-add for vague/generic queries like "add product in cart"
        // Require at least one specific product descriptor beyond generic placeholders
        const genericProductWords = new Set(['product', 'item', 'thing', 'something', 'anything', 'stuff', 'object', 'goods']);
        const specificKeywords = keywords.filter(
            kw => !cartKeywords.includes(kw) && !genericProductWords.has(kw)
        );
        const isSpecificQuery = specificKeywords.length > 0;

        const intent = hasCartIntent && isSpecificQuery && products.length > 0 ? 'add_to_cart' : 'search';
        const firstProductId = intent === 'add_to_cart' ? products[0]?._id : null;

        return {
            intent,
            firstProductId,
            products,
            keywords,
            message: intent === 'add_to_cart'
                ? `Added ${products[0]?.name || 'product'} to cart (${products.length} found)`
                : (products.length > 0
                    ? `Found ${products.length} products`
                    : 'No products found. Try different keywords.')
        };

    } catch (error) {
        console.error('🔴 AI Service Error:', error.message);

        return {
            products: [],
            message: 'AI service temporarily unavailable.'
        };
    }
};