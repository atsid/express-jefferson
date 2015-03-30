"use strict";

/**
 * Configures templating engines for an app
 */
class EngineResolver {
    constructor(app, conf) {
        this.app = app;
        this.conf = conf;
    }

    configure() {
        this.conf.engines.forEach((it) => {
            this.app.engine(it.ext, it.callback);
        });
    }
}

module.exports = EngineResolver;
