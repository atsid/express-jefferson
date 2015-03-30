"use strict";

/**
 * Declaratively initializes routes in an express app
 */
var Configuration = require("./domain/configuration");
var debug = require("debug")("jefferson");
let AppSectionClasses = [
    require("./domain/appsection/locals"),
    require("./domain/appsection/engines"),
    require("./domain/appsection/resolvers"),
    require("./domain/appsection/routes")
];

module.exports = (app, conf) => {
    if (!app) {
        throw new Error("app parameter must be supplied");
    }
    if (!conf) {
        throw new Error("application configuration must be supplied");
    }
    conf = new Configuration(conf);
    AppSectionClasses.map((Type) => {
        debug(`configuring ${Type.name}`);
        new Type(app, conf).configure();
    });
};
