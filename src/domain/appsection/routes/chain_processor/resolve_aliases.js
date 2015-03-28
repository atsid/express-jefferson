"use strict";

module.exports = {
    /**
     * Resolves alias references in a middleware cahin
     * @param middleware
     */
    process (middleware, conf) {
        let isAlias = (x) => typeof x === "string";
        let getAlias = (aliasName) => {
            if (!conf.aliases[aliasName]) {
                throw new Error(`could not find alias ${aliasName}`);
            }
            return conf.aliases[aliasName];
        };

        for (let i = middleware.length - 1; i >= 0; i--) {
            if (isAlias(middleware[i])) {
                middleware.splice.apply(middleware, [i, 1].concat(getAlias(middleware[i])));
            }
        }
        return middleware;
    }
};
