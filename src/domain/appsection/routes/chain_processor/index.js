const configSections = [
    require('./resolve_aliases'),
    require('./proxy_wrap'),
];

/**
 * Configures a middleware chain
 * @param middleware An array of middleware functions
 * @returns {*} An array of middleware functions
 */
module.exports = {
    process(middleware, conf) {
        let composed = middleware;
        configSections.forEach((section) => {
            composed = section.process(composed, conf);
        });
        return composed;
    },
};
