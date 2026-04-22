import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-buddy';

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        logger.info('🟢 MongoDB connected successfully');
    } catch (error) {
        logger.error('🔴 MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

