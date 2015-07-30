/**
 * Resolves alias references in a middleware cahin
 * @param middleware
 */
function process(middleware, conf) {
    const isAlias = (x) => typeof x === 'string';
    function getAlias(aliasName) {
        const found = conf.aliases[aliasName];
        if (!found) {
            throw new Error(`could not find alias ${aliasName}`);
        }
        return found;
    }

    for (let i = middleware.length - 1; i >= 0; i--) {
        if (isAlias(middleware[i])) {
            const aliasResult = process(getAlias(middleware[i]), conf);
            middleware.splice.apply(middleware, [i, 1].concat(aliasResult));
        }
    }
    return middleware;
}

module.exports = {process};
