import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import User from '../src/model/usermodel.js';

jest.setTimeout(30000);

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
    await User.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('GET /api/auth/me', () => {
    const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullName: {
            firstName: 'Test',
            lastName: 'User'
        }
    };

    let user;
    let token;

    beforeEach(async () => {
        // Create a test user in the database
        user = await User.create(testUser);

        // Generate a JWT token for the user
        const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret';
        token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }, jwtSecret, { expiresIn: '7d' });
    });

    it('should return user information when authenticated with valid token', async () => {
        const response = await request(app)
            .get('/api/auth/me')
            .set('Cookie', [`token=${token}`]);

        expect(response.status).toBe(200);
        expect(response.body.user).toMatchObject({
            username: testUser.username,
            email: testUser.email,
            fullName: testUser.fullName,
            role: 'user'
        });
        expect(response.body.user.password).toBeUndefined();
        expect(response.body.user._id).toBeDefined();
    });

    it('should return user information when authenticated with Authorization header', async () => {
        const response = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.user).toMatchObject({
            username: testUser.username,
            email: testUser.email,
            fullName: testUser.fullName,
            role: 'user'
        });
        expect(response.body.user.password).toBeUndefined();
    });

    it('should return 401 when no token is provided', async () => {
        const response = await request(app)
            .get('/api/auth/me');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Unauthorized');
    });

    it('should return 401 when invalid token is provided', async () => {
        const response = await request(app)
            .get('/api/auth/me')
            .set('Cookie', ['token=invalid_token']);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Unauthorized');
    });

    it('should return 401 when expired token is provided', async () => {
        // Create an expired token
        const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret';
        const expiredToken = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }, jwtSecret, { expiresIn: '-1h' }); // Already expired

        const response = await request(app)
            .get('/api/auth/me')
            .set('Cookie', [`token=${expiredToken}`]);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Unauthorized');
    });

    it('should return 401 when token is for non-existent user', async () => {
        // Create a token for a user that doesn't exist
        const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret';
        const fakeUserId = new mongoose.Types.ObjectId();
        const fakeToken = jwt.sign({
            id: fakeUserId,
            username: 'nonexistent',
            email: 'nonexistent@example.com',
            role: 'user'
        }, jwtSecret, { expiresIn: '7d' });

        const response = await request(app)
            .get('/api/auth/me')
            .set('Cookie', [`token=${fakeToken}`]);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Unauthorized');
    });

    it('should not expose sensitive user information', async () => {
        const response = await request(app)
            .get('/api/auth/me')
            .set('Cookie', [`token=${token}`]);

        expect(response.status).toBe(200);
        expect(response.body.user.password).toBeUndefined();
        expect(response.body.user.__v).toBeUndefined();
        expect(response.body.user.createdAt).toBeUndefined();
        expect(response.body.user.updatedAt).toBeUndefined();
    });
});