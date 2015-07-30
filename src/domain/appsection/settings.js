const debug = require('debug')('jefferson:settings');

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
        const settingsKeys = Object.keys(this.conf.settings);
        settingsKeys.forEach((key) => {
            const value = this.conf.settings[key];
            debug(`configuring setting ${key} => ${typeof value}`);
            this.app.set(key, value);
        });
    }
}

module.exports = Settings;
