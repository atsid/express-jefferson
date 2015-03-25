'use strict';
let debug = require('debug');

/**
 * A Jefferson proxy that logs the invocation of a middleware.
 * @type {{name: string, init: Function}}
 */
module.exports = {
    name: 'Trace Logger',
    init: (delegate, conf, middlewareIndex) => {
        if (!delegate || typeof delegate !== "function") {
            throw new Error("'delegate' argument must exist and be a function. MiddlewareIndex: " + middlewareIndex);
        }
        let logger = debug((conf && conf.logger) || 'jefferson:trace-logger');

        return (req, res, next) => {
            logger('invoking middleware ' + middlewareIndex);
            delegate(req, res, next);
        };
    }
};
