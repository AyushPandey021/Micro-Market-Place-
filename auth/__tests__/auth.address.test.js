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

describe('User address APIs', () => {
    const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullName: {
            firstName: 'Test',
            lastName: 'User'
        }
    };

    let token;
    let user;

    beforeEach(async () => {
        user = await User.create(testUser);
        const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret';
        token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }, jwtSecret, { expiresIn: '7d' });
    });

    it('should return empty address list when none exist', async () => {
        const response = await request(app)
            .get('/api/auth/users/me/address')
            .set('Cookie', [`token=${token}`]);

        expect(response.status).toBe(200);
        expect(response.body.addresses).toBeInstanceOf(Array);
        expect(response.body.addresses).toHaveLength(0);
    });

    it('should add a new address successfully', async () => {
        const addressData = {
            street: '123 Main St',
            city: 'Testville',
            state: 'TX',
            zip: '12345',
            country: 'USA'
        };

        const response = await request(app)
            .post('/api/auth/users/me/address')
            .set('Cookie', [`token=${token}`])
            .send(addressData);

        expect(response.status).toBe(201);
        expect(response.body.address).toMatchObject(addressData);
        expect(response.body.address._id).toBeDefined();
    });

    it('should return 400 when required address fields are missing', async () => {
        const response = await request(app)
            .post('/api/auth/users/me/address')
            .set('Cookie', [`token=${token}`])
            .send({ street: '123 Main St' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('All address fields are required');
    });

    it('should delete an existing address successfully', async () => {
        const addressData = {
            street: '123 Main St',
            city: 'Testville',
            state: 'TX',
            zip: '12345',
            country: 'USA'
        };

        const addResponse = await request(app)
            .post('/api/auth/users/me/address')
            .set('Cookie', [`token=${token}`])
            .send(addressData);

        const addressId = addResponse.body.address._id;

        const deleteResponse = await request(app)
            .delete(`/api/auth/users/me/address/${addressId}`)
            .set('Cookie', [`token=${token}`]);

        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body.message).toBe('Address deleted successfully');

        const getResponse = await request(app)
            .get('/api/auth/users/me/address')
            .set('Cookie', [`token=${token}`]);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.addresses).toHaveLength(0);
    });

    it('should return 404 when deleting a non-existent address', async () => {
        const invalidAddressId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .delete(`/api/auth/users/me/address/${invalidAddressId}`)
            .set('Cookie', [`token=${token}`]);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Address not found');
    });
});