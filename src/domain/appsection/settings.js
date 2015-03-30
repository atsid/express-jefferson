"use strict";
let debug = require("debug")("jefferson:settings");

/**
 * Configures application settings
 * http://expressjs.com/api.html#app.set
 */
class Settings {
    constructor(app, conf) {
        this.app = app;
        this.conf = conf;
    }

    configure() {
        let settingsKeys = Object.keys(this.conf.settings);
        settingsKeys.forEach((key) => {
            let value = this.conf.settings[key];
            debug(`configuring setting ${key} => ${typeof value}`);
            this.app.set(key, value);
        });
    }
}

module.exports = Settings;
