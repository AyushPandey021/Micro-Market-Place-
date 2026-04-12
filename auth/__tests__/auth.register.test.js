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

describe('POST /auth/register', () => {
    const validUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullName: {
            firstName: 'Test',
            lastName: 'User'
        }
    };

    it('creates a new user and returns 201', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send(validUser);

        expect(response.status).toBe(201);
        expect(response.body.user).toMatchObject({
            username: validUser.username,
            email: validUser.email,
            fullName: validUser.fullName
        });
        expect(response.body.user.password).toBeUndefined();
    });

    it('returns 400 when required fields are missing', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({ username: '', email: '', password: '', firstName: '', lastName: '' });

        expect(response.status).toBe(400);
        expect(Array.isArray(response.body.errors)).toBe(true);
        expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('returns 409 when the user already exists', async () => {
        await request(app).post('/api/auth/register').send(validUser);
        const duplicateResponse = await request(app).post('/api/auth/register').send(validUser);

        expect(duplicateResponse.status).toBe(409);
        expect(duplicateResponse.body.error).toBe('User already exists');
    });
});
