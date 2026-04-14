export default {
    testEnvironment: 'node',
    extensionsToTreatAsEsm: [],
    testPathIgnorePatterns: ['/node_modules/'],
    setupFiles: ['./jest.setup.js'],
    moduleFileExtensions: ['js', 'json'],
    collectCoverageFrom: ['src/**/*.js', '!src/config/**'],
    testMatch: ['**/__tests__/**/*.test.js']
};
