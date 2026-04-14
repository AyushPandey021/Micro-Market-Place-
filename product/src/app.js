import express from 'express';
import cookieParser from 'cookie-parser';
import ProductRoutes from './routes/product.routes.js';
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/products', ProductRoutes);

app.get('/', (req, res) => {
    res.send('Product Service is running!');
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found. Use /api/products',
        path: req.originalUrl
    });
});

export default app;
