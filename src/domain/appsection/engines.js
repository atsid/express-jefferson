"use strict";
let debug = require("debug")("jefferson:engines");

/**
 * Configures templating engines for an app
 */
class Engines {
    constructor(app, conf) {
        this.app = app;
        this.conf = conf;
    }

    configure() {
        this.conf.engines.forEach((it) => {
            debug(`configuring engine ${it.ext}`);
            this.app.engine(it.ext, it.callback);
        });
    }
}

module.exports = Engines;
