const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const axios = require('axios');
const { parseShoppingQuery } = require('../src/utils/parseShoppingQuery.js');
const { detectIntent } = require('../src/utils/ai.js');
const { processAIQuery } = require('../src/services/aiProcessor.js');

jest.mock('axios');


describe('AI Shopping Assistant - Task Examples', () => {
    describe('parseShoppingQuery', () => {
        it('Example 1: "Men\'s Stylish Kurta" → exact filters', () => {
            const result = parseShoppingQuery("Men's Stylish Kurta");
            expect(result.filters.keywords).toHaveLength(3);
            expect(result.filters.keywords).toEqual(expect.arrayContaining(['men', 'stylish', 'kurta']));
            expect(result.normalized_query).toBe("men stylish kurta");
        });



        it('Example 2: "Find red shoes under 2000" → price_max', () => {
            const result = parseShoppingQuery('Find red shoes under 2000');
            expect(result.filters.price_max).toBe(2000);
            expect(result.filters.keywords).toEqual(['red', 'shoes']);
            expect(result.normalized_query).toBe('red shoes');
        });



        it('Normalization: apostrophes and mappings', () => {
            const result = parseShoppingQuery("Men's shoes");
            expect(result.filters.keywords).toEqual(['men', 'shoes']);
        });

    });

    describe('detectIntent', () => {
        it('Detects search by default', () => {
            expect(detectIntent('red shoes')).toBe('search');
        });

        it('Detects add_to_cart', () => {
            expect(detectIntent('add red shoes to cart')).toBe('add_to_cart');
        });

        it('Detects create_cart', () => {
            expect(detectIntent('create new cart')).toBe('create_cart');
        });

        it('Detects clarification', () => {
            expect(detectIntent('what can you do?')).toBe('clarification');
        });
    });

    describe('processAIQuery - Full Pipeline', () => {
        it('Example 1: Full "Men\'s Stylish Kurta"', async () => {
            const result = await processAIQuery("Men's Stylish Kurta");
            expect(result.intent).toBe('search');
            expect(result.raw_query).toBe("Men's Stylish Kurta");
            expect(result.normalized_query).toBe("men stylish kurta");
            expect(result.filters).toHaveProperty('keywords');
            expect(result.filters.keywords).toHaveLength(3);
            expect(result.filters.keywords).toEqual(expect.arrayContaining(['men', 'stylish', 'kurta']));
            expect(result.filters.product_name).toBeUndefined();
            expect(result.tool_call.name).toBe('search_products');
            expect(result.tool_call.arguments.keywords).toEqual(expect.arrayContaining(['men', 'stylish', 'kurta']));
            expect(result.message).toContain('Searching');
        });



        it('Example 2: "Find red shoes under 2000"', async () => {
            const result = await processAIQuery('Find red shoes under 2000');
            expect(result.intent).toBe('search');
            expect(result.filters.price_max).toBe(2000);
            expect(result.filters.color).toBeUndefined();
            expect(result.filters.keywords).toHaveLength(2);
            expect(result.filters.keywords).toContain('red');
            expect(result.filters.keywords).toContain('shoes');
            expect(result.tool_call.arguments.price_max).toBe(2000);
        });


        it('Non-search intent: empty filters', async () => {
            const result = await processAIQuery('add to cart');
            expect(result.intent).toBe('add_to_cart');
            expect(result.filters).toEqual({});
            expect(result.normalized_query).toBe('');
        });

        it('Empty query: clarification', async () => {
            const result = await processAIQuery('');
            expect(result.intent).toBe('clarification');
        });
    });
});

