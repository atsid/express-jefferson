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
        Object.keys(this.conf.engines).forEach((ext) => {
            debug(`configuring engine ${ext}`);
            this.app.engine(ext, this.conf.engines[ext]);
        });
    }
}

module.exports = Engines;
