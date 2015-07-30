function boilerplateSection(section) {
    const result = section || {};
    function initSubsection(name, defaultValue = []) {
        if (!result[name]) {
            result[name] = defaultValue;
        }
    }
    initSubsection('all');
    initSubsection('safe');
    initSubsection('unsafe');
    initSubsection('method', {});
    return result;
}

/**
 * The configuration class provides sane defaults for incoming configuration values.
 */
class Configuration {
    constructor(conf) {
        this.routes = conf.routes || {};
        this.params = conf.params || {};
        this.aliases = conf.aliases || {};
        this.proxies = conf.proxies || [];
        this.locals = conf.locals || {};
        this.enable = conf.enable || [];
        this.disable = conf.disable || [];
        this.engines = conf.engines || {};
        this.settings = conf.settings || {};
        this.pre = boilerplateSection(conf.pre);
        this.post = boilerplateSection(conf.post);
    }
}

module.exports = Configuration;
