import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';

// Connect to the database
connectDB();


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Product service is running on port ${PORT}`);
    console.log(`Send requests to http://localhost:${PORT}/api/products`);
});