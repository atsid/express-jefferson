"use strict";
let configSections = [
    require("./resolve_aliases"),
    require("./proxy_wrap")
];

/**
 * Configures a middleware chain
 * @param middleware An array of middleware functions
 * @returns {*} An array of middleware functions
 */
module.exports = {
    process (middleware, conf) {
        configSections.forEach((section) => {
            middleware = section.process(middleware, conf);
        });
        return middleware;
    }
};
