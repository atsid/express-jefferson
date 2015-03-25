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
    init: (delegate, conf, middlewareIndex) => {
        if (!delegate || typeof delegate !== "function") {
            throw new Error("'delegate' argument must exist and be a function. MiddlewareIndex: " + middlewareIndex);
        }
        return (req, res, next) => {
            let nextTriggered = false;
            let invokeNext = (arg) => {
                if (!nextTriggered) {
                    nextTriggered = true;
                    next(arg);
                }
            };
            let isFlowHalted = () => conf && conf.haltCondition && conf.haltCondition(req, res);
            let possiblePromise = delegate(req, res, invokeNext);
            return JPromise.resolve(possiblePromise)
                .then(() => {
                    if (!isFlowHalted()) {
                        invokeNext();
                    }
                })
                .catch(next);
        };
    }
};
