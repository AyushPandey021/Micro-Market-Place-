import jwt from 'jsonwebtoken';
import User from '../model/usermodel.js';
import redis from '../config/redis.js';

async function authMiddleware(req, res, next) {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Check if token is blacklisted
        let isBlacklisted = false;
        try {
            isBlacklisted = await redis.get(`blacklist:${token}`);
        } catch (redisError) {
            console.warn('Redis blacklist check failed:', redisError.message);
        }

        if (isBlacklisted) {
            return res.status(401).json({ error: 'Token has been revoked' });
        }

        const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret';
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

export default authMiddleware;