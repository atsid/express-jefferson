"use strict";

/**
 * Declaratively initializes routes in an express app
 */
var Configuration = require("./domain/configuration");
var debug = require("debug")("jefferson");
var express = require("express");
let AppSectionClasses = [
    require("./domain/appsection/locals"),
    require("./domain/appsection/toggles"),
    require("./domain/appsection/settings"),
    require("./domain/appsection/engines"),
    require("./domain/appsection/resolvers"),
    require("./domain/appsection/routes")
];

/**
 * Main jefferson entry point.
 * @param app
 * @param conf
 */
let jefferson = (app, conf) => {
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

/**
 * Static helper function that creates a new express app from scratch, then binds the config.
 * @param conf
 */
jefferson.app = function (conf) {
    debug("Creating new jefferson app with config");
    var app = express();
    this(app, conf);
    return app;
};

/**
 * Static helper function that creates a new express Router, then binds the config.
 * @param conf
 */
jefferson.router = function (conf) {
    debug("Creating new jefferson Router with config");
    /*eslint-disable new-cap*/
    var router = express.Router();
    this(router, conf);
    return router;
};

module.exports = jefferson;
