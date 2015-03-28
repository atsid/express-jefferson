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

class Configuration {
    constructor(conf) {
        this.proxies = conf.proxies || [];
        this.params = conf.params || {};
        this.routes = conf.routes || {};
        this.aliases = conf.aliases || {};
        this.pre = boilerplateSection(conf.pre);
        this.post = boilerplateSection(conf.post);
    }

    /**
     * Resolves an alias reference
     * @param aliasName
     * @param middlewareChain
     */
    getAlias(aliasName) {
        if (!this.aliases[aliasName]) {
            throw new Error(`could not find alias ${aliasName}`);
        }
        return this.aliases[aliasName];
    }
}

module.exports = Configuration;
