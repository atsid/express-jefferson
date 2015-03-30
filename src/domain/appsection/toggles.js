"use strict";
let debug = require("debug")("jefferson:settings-toggles");

/**
 * Enables/Disables Features in the app settings
 * http://expressjs.com/api.html#app.enable
 * http://expressjs.com/api.html#app.disable
 */
class Toggles {
    constructor (app, conf) {
        this.app = app;
        this.conf = conf;
    }

    configure() {
        debug(`enabling ${this.conf.enable}`);
        this.conf.enable.forEach((feature) => this.app.enable(feature));
        debug(`disabling ${this.conf.disable}`);
        this.conf.disable.forEach((feature) => this.app.disable(feature));
    }
}

module.exports = Toggles;
