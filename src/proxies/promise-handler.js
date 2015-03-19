'use strict';
var JPromise = Promise || require('bluebird');

/**
 * A Jefferson proxy that resolves promise-based middleware functions.
 * If a middleware function accepts 2 arguments, we will wrap it in a promise chain.
 * If it throws or resolves to an error, next() is invoked with the error.
 * @type {{name: string, init: Function}}
 */
module.exports = {
    name: 'Promise Handler',
    init: (delegate) => {
        return (req, res, next) => {
            let nextTriggered = false;
            let nextProxy = (arg) => {
                if (!nextTriggered) {
                    nextTriggered = true;
                    next(arg);
                }
            };
            let possiblePromise = delegate(req, res, nextProxy);
            JPromise.resolve(possiblePromise).then(() => nextProxy()).catch(next);
        };
    }
};
