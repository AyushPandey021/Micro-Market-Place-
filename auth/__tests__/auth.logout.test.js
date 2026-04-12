import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
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

describe('POST /api/auth/logout', () => {
    const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullName: {
            firstName: 'Test',
            lastName: 'User'
        }
    };

    beforeEach(async () => {
        // Create a test user in the database
        await User.create(testUser);
    });

    it('should logout successfully and clear cookie', async () => {
        // First, login to get the token
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: testUser.username,
                password: testUser.password
            });

        expect(loginResponse.status).toBe(200);
        const token = loginResponse.body.token;
        const cookie = loginResponse.headers['set-cookie'][0];

        // Now, logout using the cookie
        const logoutResponse = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', cookie);

        expect(logoutResponse.status).toBe(200);
        expect(logoutResponse.body.message).toBe('Logged out successfully');

        // Check that the cookie is cleared
        expect(logoutResponse.headers['set-cookie']).toBeDefined();
        expect(logoutResponse.headers['set-cookie'][0]).toMatch(/token=;/); // Cookie cleared
    });

    it('should return 401 when not authenticated', async () => {
        const response = await request(app)
            .post('/api/auth/logout');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Unauthorized');
    });
});