const JPromise = Promise || require('bluebird');

/**
 * A Jefferson proxy that resolves promise-based middleware functions.
 * If a middleware function accepts 2 arguments, we will wrap it in a promise chain.
 * If it throws or resolves to an error, next() is invoked with the error.
 *
 * NOTE: This should be the innermost proxy
 *
 * @type {{name: string, init: Function}}
 */
module.exports = {
    name: 'Promise Handler',
    init: (delegate, conf, middlewareIndex) => {
        if (!delegate || typeof delegate !== 'function') {
            throw new Error('\'delegate\' argument must exist and be a function. MiddlewareIndex: ' + middlewareIndex);
        }
        return (req, res, next) => {
            let nextTriggered = false;
            function invokeNext(arg) {
                if (!nextTriggered) {
                    nextTriggered = true;
                    next(arg);
                }
            }
            const isFlowHalted = () => conf && conf.haltCondition && conf.haltCondition(req, res);
            const possiblePromise = delegate(req, res, invokeNext);
            return JPromise.resolve(possiblePromise)
                .then(() => {
                    if (!isFlowHalted()) {
                        invokeNext();
                    }
                })
                .catch(next);
        };
    },

    /**
     * Promisifies an async middleware function.
     * @param delegate
     */
    promisify: (delegate) => {
        return (req, res, next) => {
            return new JPromise((resolve, reject) => {
                function proxyNext(err) {
                    next(err);
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
                delegate(req, res, proxyNext);
            });
        };
    },
};
