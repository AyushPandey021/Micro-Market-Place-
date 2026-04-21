# AI Shopping Assistant Implementation TODO

## Steps:

- [x] 1. Update types/shoppingFilters.js (simplify Zod schema to keywords + price_max)
- [x] 2. Update utils/parseShoppingQuery.js (filters: {keywords, price_max only}; compute normalized_query)
- [x] 3. Update utils/ai.js (refine detectIntent/generateMessage for exact spec; remove legacy parseQueryWithAI)
- [x] 4. Update services/aiProcessor.js (exact JSON structure matching task examples)
- [x] 5. Update **tests**/aiShopping.test.js (align tests with simplified filters)

- [ ] 6. Run tests: cd Ai-Buddy && npm test
- [ ] 7. Complete

Current: Starting edits...
