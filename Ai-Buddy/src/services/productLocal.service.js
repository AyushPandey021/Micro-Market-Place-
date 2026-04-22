import Product from '../models/Product.js';
import logger from '../utils/logger.js';

const SAMPLE_PRODUCTS = [
    {
        title: "Men's Stylish Kurta",
        description: "Traditional men's kurta for casual wear",
        priceAmount: 1599,
        priceCurrency: 'INR',
        images: ['https://example.com/kurta1.jpg'],
        stock: 50
    },
    {
        title: "Men's Wedding Sherwani",
        description: "Premium sherwani for wedding",
        priceAmount: 9999,
        priceCurrency: 'INR',
        images: ['https://example.com/sherwani1.jpg'],
        stock: 20
    },
    {
        title: "Men's Shoes",
        description: "Casual leather shoes for men",
        priceAmount: 2499,
        priceCurrency: 'INR',
        images: ['https://example.com/shoes1.jpg'],
        stock: 100
    },
    {
        title: "Men's Watch",
        description: "Stylish analog watch",
        priceAmount: 3999,
        priceCurrency: 'INR',
        images: ['https://example.com/watch1.jpg'],
        stock: 75
    },
    {
        title: "Men's Hoodie",
        description: "Comfortable hoodie for casual wear",
        priceAmount: 1299,
        priceCurrency: 'INR',
        images: ['https://example.com/hoodie1.jpg'],
        stock: 60
    }
];

// Seed sample data if empty
export const ensureSampleData = async () => {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            await Product.insertMany(SAMPLE_PRODUCTS);
            console.log('🟢 Seeded', SAMPLE_PRODUCTS.length, 'sample products');
        }
    } catch (error) {
        console.error('🔴 Seed error:', error.message);
    }
};

/**
 * Smart search per spec: keywords OR regex on title + fallback
 */
export const searchProducts = async (keywords = []) => {
    if (!keywords || keywords.length === 0) {
        console.log('🟣 No keywords provided, returning empty');
        return [];
    }

    try {
        console.log('🟣 Mongo Query:', { keywords });

        // Spec: OR-based keyword matching on title
        const query = {
            $or: keywords.map(word => ({
                title: { $regex: word, $options: 'i' }
            }))
        };

        let products = await Product.find(query).limit(20);

        // Fallback if no results
        if (products.length === 0) {
            console.log('🟣 No exact matches, trying fallback combined regex');
            const fallbackRegex = keywords.join('|');
            products = await Product.find({
                title: { $regex: fallbackRegex, $options: 'i' }
            }).limit(20);
        }

        console.log('🟣 Products Found:', products.length);
        return products;

    } catch (error) {
        console.error('🔴 Search error:', error.message);
        return [];
    }
};

export default { searchProducts, ensureSampleData };

