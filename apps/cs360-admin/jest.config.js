module.exports = {
    preset: "jest-preset-angular",
    roots: ['src'],
    testRegex: [/.spec\.ts$/],
    setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
    moduleNameMapper: {
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "jest-transform-stub",
        "\\.(css|less|scss)$": "jest-transform-stub"
    },
    coveragePathIgnorePatterns: [
        "node_modules",
        "<rootDir>/libs/"
    ]
}
