import amqp from 'amqplib';

let connection = null;
let channel = null;

export async function connectRabbitMQ() {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
    }
}

export async function publishEvent(eventType, data) {
    if (!channel) {
        console.warn('RabbitMQ channel not available, skipping event publish');
        return;
    }

    try {
        const exchange = 'order_events';
        await channel.assertExchange(exchange, 'topic', { durable: true });
        channel.publish(exchange, eventType, Buffer.from(JSON.stringify(data)));
        console.log(`Event published: ${eventType}`, data);
    } catch (error) {
        console.error('Error publishing event:', error);
    }
}

export async function closeRabbitMQ() {
    if (channel) await channel.close();
    if (connection) await connection.close();
}