import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './src/config/db.js';
import authRouter from './src/routes/auth.route.js';
import redis from './src/config/redis.js';

const app = express();
app.use(cookieParser());
app.use(express.json());

app.use('/api', authRouter);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});


if (process.env.NODE_ENV !== 'test') {
    connectDB();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app; 
