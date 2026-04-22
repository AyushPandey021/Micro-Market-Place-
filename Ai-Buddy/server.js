import 'dotenv/config';
import http from 'http';
import app from './src/app.js';
import initSocketServer from './src/sockets/socket.server.js';
import logger from './src/utils/logger.js';

const PORT = process.env.PORT || 5006;

// Create HTTP server
const server = http.createServer(app);

// Initialize socket.io server
initSocketServer(server);

// Start server
server.listen(PORT, () => {
    logger.info(
        {
            port: PORT,
            environment: process.env.NODE_ENV ||5005,
        },
        'AI Buddy Service started'
    );
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error(error, 'Uncaught Exception');
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, 'Unhandled Rejection');
    process.exit(1);
});
