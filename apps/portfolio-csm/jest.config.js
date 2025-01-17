module.exports = {
    preset: "jest-preset-angular",
    roots: ['src/app'],
    testRegex: ["portfolio-csm-widget.component.spec.ts"],
    setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
    //apps/dashboard-builder/src/app/dashboard-builder/image-widget-holder/image-widget-holder.component.spec.ts
    moduleNameMapper: {
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "jest-transform-stub",
        "\\.(css|less|scss)$": "jest-transform-stub",
        // "@gs/shared$": "<rootDir>/libs/shared/src/index.ts",
        // "libs(.*)$": "<rootDir>/libs/$1"
    },
    coveragePathIgnorePatterns: [
        "node_modules",
        "<rootDir>/libs/"
    ]
}