import { describe, it, expect, jest } from '@jest/globals';
import request from 'supertest';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authMiddlewareMock = {
    __esModule: true,
    default: jest.fn(() => (req, res, next) => {
        req.user = { id: 'test-seller-id' };
        next();
    })
};

const productModelMock = {
    __esModule: true,
    default: jest.fn().mockImplementation(function (data) {
        return {
            ...data,
            save: jest.fn().mockResolvedValue({ ...data })
        };
    })
};

jest.unstable_mockModule('../src/middleware/auth.middleware.js', () => authMiddlewareMock);
jest.unstable_mockModule('../src/models/product.model.js', () => productModelMock);

const { default: app } = await import('../src/app.js');

describe('POST /api/products/', () => {
    it('should create a product with Images and valid data', async () => {
        const imagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

        const response = await request(app)
            .post('/api/products/')
            .field('title', 'Test Product')
            .field('description', 'This is a test product')
            .field('priceAmount', '99.99')
            .field('priceCurrency', 'USD')
            .attach('Images', imagePath);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Product created successfully');
        expect(response.body.data.title).toBe('Test Product');
        expect(response.body.data.priceAmount).toBe(99.99);
        expect(response.body.data.priceCurrency).toBe('USD');
        expect(Array.isArray(response.body.data.images)).toBe(true);
        expect(response.body.data.images[0]).toHaveProperty('url');
        expect(response.body.data.images[0]).toHaveProperty('fileId');
    });

    it('should return 400 when title is missing', async () => {
        const imagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

        const response = await request(app)
            .post('/api/products/')
            .field('description', 'No title product')
            .field('priceAmount', '99.99')
            .attach('Images', imagePath);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ param: 'title' })
            ])
        );
    });

    it('should return 400 when priceAmount is missing', async () => {
        const imagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');

        const response = await request(app)
            .post('/api/products/')
            .field('title', 'No Price Product')
            .field('description', 'Missing price')
            .attach('Images', imagePath);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ param: 'priceAmount' })
            ])
        );
    });

    it('should return 400 when images are missing', async () => {
        const response = await request(app)
            .post('/api/products/')
            .field('title', 'No Image Product')
            .field('priceAmount', '1000')
            .field('description', 'Missing image');

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Images are required');
    });
});

