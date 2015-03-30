"use strict";

let boilerplateSection = (section) => {
    let result = section || {};
    let initSubsection = (name, defaultValue = []) => {
        if (!result[name]) {
            result[name] = defaultValue;
        }
    };
    initSubsection("all");
    initSubsection("safe");
    initSubsection("unsafe");
    initSubsection("method", {});
    return result;
};

/**
 * The configuration class provides sane defaults for incoming configuration values.
 */
class Configuration {
    constructor(conf) {
        this.routes = conf.routes || {};
        this.params = conf.params || {};
        this.aliases = conf.aliases || {};
        this.proxies = conf.proxies || [];
        this.engines = conf.engines || [];
        this.pre = boilerplateSection(conf.pre);
        this.post = boilerplateSection(conf.post);
    }
}

module.exports = Configuration;
