import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import request from 'supertest';
import axios from 'axios';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import Order from '../src/models/order.model.js';

// Mock axios
jest.mock('axios');


jest.setTimeout(30000);

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
    await Order.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Order Service', () => {
    describe('POST /api/orders', () => {
        it('should create an order', async () => {
            // Mock cart service
            axios.get.mockResolvedValue({
                data: {
                    items: [
                        { productId: 'prod1', quantity: 2, price: 10 },
                        { productId: 'prod2', quantity: 1, price: 20 }
                    ]
                }
            });

            // Mock product service for inventory check
            axios.get.mockImplementation((url) => {
                if (url.includes('/prod1')) {
                    return Promise.resolve({
                        data: { data: { stock: 5, priceAmount: 10, title: 'Product 1' } }
                    });
                } else if (url.includes('/prod2')) {
                    return Promise.resolve({
                        data: { data: { stock: 3, priceAmount: 20, title: 'Product 2' } }
                    });
                }
            });

            // Mock payment service
            axios.post = jest.fn().mockResolvedValue({});

            // Mock clear cart
            axios.delete.mockResolvedValue({});

            const orderData = {
                shippingAddress: {
                    street: '123 Main St',
                    city: 'Anytown',
                    state: 'CA',
                    country: 'USA',
                    zipCode: '12345'
                }
            };

            const response = await request(app)
                .post('/api/orders')
                .send(orderData);

            if (response.status !== 201) {
                console.log('Error response:', response.body);
            }

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('orderId');
        });
    });

    describe('GET /api/orders/me', () => {
        it('should get user orders', async () => {
            const response = await request(app)
                .get('/api/orders/me');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });
});