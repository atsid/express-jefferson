const debug = require('debug')('jefferson:locals');

/**
 * Configures application locals, which are available to Templating engines:
 * http://expressjs.com/api.html#app.locals
 */
class Locals {
    constructor(app, conf) {
        this.app = app;
        this.conf = conf;
    }

    configure() {
        const locals = this.conf.locals;
        Object.keys(locals).forEach((key) => {
            const value = locals[key];
            debug(`defining local ${key} => ${typeof value}`);
            this.app.locals[key] = value;
        });
    }
}

module.exports = Locals;
