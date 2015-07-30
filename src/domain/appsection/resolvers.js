const debug = require('debug')('jefferson');

/**
 * Configures parameter resolvers for the application
 */
class Resolvers {
    constructor(app, conf) {
        this.app = app;
        this.conf = conf;
    }

    configure() {
        const resolvers = Object.keys(this.conf.params);
        resolvers.forEach(this.wireResolver, this);
    }

    wireResolver(name) {
        debug(`defining parameter resolver for '${name}'`);
        this.app.param(name, this.conf.params[name]);
    }
}

module.exports = Resolvers;
