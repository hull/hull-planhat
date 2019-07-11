module.exports = {
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    testPathIgnorePatterns: ["/lib/", "/node_modules/", "/build/", "/build-types/"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    collectCoverage: true,
    testEnvironment: "node",
    coverageThreshold: {
        global: {
          branches: 75,
          functions: 95,
          lines: 95,
          statements: 95
        }
      },
};