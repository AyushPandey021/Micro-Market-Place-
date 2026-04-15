import jwt from 'jsonwebtoken';
import User from '../model/usermodel.js';

import redis from "../config/redis.js";
// User Register
async function register(req, res) {
    try {
        const {
            username,
            email,
            password,
            fullName = {},
            firstName: topFirstName,
            lastName: topLastName,
            role
        } = req.body;

        const firstName = fullName.firstName || topFirstName;
        const lastName = fullName.lastName || topLastName;

        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const user = await User.create({
            username,
            email,
            password,
            fullName: {
                firstName,
                lastName
            },
            role
        });

        const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret';
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }, jwtSecret, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({ token, user: userResponse });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}
// User Login
async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Simple password comparison (in production, use bcrypt)
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret';
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }, jwtSecret, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({ token, user: userResponse });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}
// Me

async function getCurrentUser(req, res) {
    try {
        const user = await User.findById(req.user.id).select('-password -__v -createdAt -updatedAt');
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

async function getUserAddresses(req, res) {
    try {
        const user = await User.findById(req.user.id).select('addresses');
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        res.status(200).json({ addresses: user.addresses || [] });
    } catch (error) {
        console.error('Get user addresses error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

async function addUserAddress(req, res) {
    try {
        const { street, city, state, zip, country } = req.body;

        if (!street || !city || !state || !zip || !country) {
            return res.status(400).json({ error: 'All address fields are required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const address = { street, city, state, zip, country };
        user.addresses.push(address);
        await user.save();

        const createdAddress = user.addresses[user.addresses.length - 1];
        res.status(201).json({ address: createdAddress });
    } catch (error) {
        console.error('Add user address error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

async function deleteUserAddress(req, res) {
    try {
        const { addressid } = req.params;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const address = user.addresses.id ? user.addresses.id(addressid) : null;
        if (!address) {
            const filtered = user.addresses.filter((item) => item._id?.toString() !== addressid);
            if (filtered.length === user.addresses.length) {
                return res.status(404).json({ error: 'Address not found' });
            }
            user.addresses = filtered;
        } else {
            if (typeof address.remove === 'function') {
                address.remove();
            } else {
                user.addresses = user.addresses.filter((item) => item._id?.toString() !== addressid);
            }
        }

        await user.save();

        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Delete user address error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}
// Logout
async function logout(req, res) {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                // Add token to blacklist with expiration (1 days)
                await redis.set(`blacklist:${token}`, 'true', 'EX', 24 * 24 * 60 * 60);
            } catch (redisError) {
                console.warn('Redis blacklist write failed:', redisError.message);
            }
        }
        res.clearCookie('token');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}
export default {
    register,
    login,
    getCurrentUser,
    getUserAddresses,
    addUserAddress,
    deleteUserAddress,
    logout
};