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
            if (delegate.length === 2) {
                JPromise.resolve(true)
                    .then(() => delegate(req, res))
                    .then(() => next())
                    .catch(next);
            } else {
                delegate(req, res, next);
            }
        };
    }
};
