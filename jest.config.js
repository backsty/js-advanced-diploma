export default {
    verbose: true,
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    transform: {
        '^.+\\.(js|jsx|mjs)$': 'babel-jest',
    },
    testPathIgnorePatterns: ['/node_modules/'],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
    moduleNameMapper: {
        '\\.(css|less)$': 'identity-obj-proxy',
    },
};