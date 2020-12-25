// snowpack.config.js

module.exports = {
    mount: {
        "src": "/",
        "assets": "/assets"
    },
    plugins: ['@snowpack/plugin-typescript'],
    alias: {
        "engine": "./src/engine",
        "game": "./src/game",
    },
    buildOptions: {
        sourceMaps: true
    }
};