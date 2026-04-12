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

describe('POST /api/auth/login', () => {
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

    it('should login successfully with valid credentials and return 200', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: testUser.username,
                password: testUser.password
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.username).toBe(testUser.username);
        expect(response.body.user.email).toBe(testUser.email);
        expect(response.body.user.password).toBeUndefined();
        expect(response.body.user.fullName).toEqual(testUser.fullName);
    });

    it('should return token in cookie', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: testUser.username,
                password: testUser.password
            });

        expect(response.status).toBe(200);
        expect(response.headers['set-cookie']).toBeDefined();
        expect(response.headers['set-cookie'][0]).toContain('token=');
    });

    it('should return 401 when username does not exist', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'nonexistentuser',
                password: 'password123'
            });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 when password is incorrect', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: testUser.username,
                password: 'wrongpassword'
            });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 400 when username is missing', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                password: testUser.password
            });

        expect(response.status).toBe(400);
        expect(Array.isArray(response.body.errors)).toBe(true);
        expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 400 when password is missing', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: testUser.username
            });

        expect(response.status).toBe(400);
        expect(Array.isArray(response.body.errors)).toBe(true);
        expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 400 when both username and password are missing', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({});

        expect(response.status).toBe(400);
        expect(Array.isArray(response.body.errors)).toBe(true);
        expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should not expose password in the response', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: testUser.username,
                password: testUser.password
            });

        expect(response.status).toBe(200);
        expect(response.body.user.password).toBeUndefined();
    });
});
