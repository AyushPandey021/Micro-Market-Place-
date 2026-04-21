export default {
    testEnvironment: 'node',
    displayName: 'ai-buddy',
    testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    transform: {},

    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/sockets/**',
        '!src/**/index.js',
    ],
    coverageThreshold: {
        global: {
            branches: 30,
            functions: 30,
            lines: 30,
            statements: 30,
        },
    },
    testTimeout: 10000,
    transformIgnorePatterns: [],
};

