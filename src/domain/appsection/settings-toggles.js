"use strict";

/**
 * Enables/Disables Features in the app settings
 * http://expressjs.com/api.html#app.enable
 * http://expressjs.com/api.html#app.disable
 */
class SettingsToggles {
    constructor (app, conf) {
        this.app = app;
        this.conf = conf;
    }

    configure() {
        if (this.conf.enable) {
            this.conf.enable.forEach((feature) => this.app.enable(feature));
        }
        if (this.conf.disable) {
            this.conf.disable.forEach((feature) => this.app.disable(feature));
        }
    }
}

module.exports = SettingsToggles;
