import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { connectRabbitMQ } from './src/services/rabbitmq.js';

// Connect to the database
connectDB();

// Connect to RabbitMQ
if (process.env.SKIP_RABBITMQ !== 'true') {
    connectRabbitMQ();
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Order service is running on port ${PORT}`);
    console.log(`Send requests to http://localhost:${PORT}/api/orders`);
});