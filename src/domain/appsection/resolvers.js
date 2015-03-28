"use strict";
var debug = require("debug")("jefferson");

/**
 * Configures parameter resolvers for the application
 */
class Resolvers {
    constructor (app, conf) {
        this.app = app;
        this.conf = conf;
    }

    /**
     * Configures the application with a parameter resolver
     * @param name The parameter name
     */
    wireResolver (name) {
        debug(`wiring parameter resolver for ${name}`);
        this.app.param(name, this.conf.params[name]);
    }

    configure () {
        let resolvers = Object.keys(this.conf.params);
        debug(`wiring ${resolvers.length} parameter resolvers`);
        resolvers.forEach(this.wireResolver, this);
    }
}

module.exports = Resolvers;
