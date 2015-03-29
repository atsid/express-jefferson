"use strict";

module.exports = {
    /**
     * Resolves alias references in a middleware cahin
     * @param middleware
     */
    process (middleware, conf) {
        let isAlias = (x) => typeof x === "string";
        let getAlias = (aliasName) => {
            let found = conf.aliases[aliasName];
            if (!found) {
                throw new Error(`could not find alias ${aliasName}`);
            }
            return found;
        };

        for (let i = middleware.length - 1; i >= 0; i--) {
            if (isAlias(middleware[i])) {
                let aliasResult = getAlias(middleware[i]);
                middleware.splice.apply(middleware, [i, 1].concat(aliasResult));
            }
        }
        return middleware;
    }
};
