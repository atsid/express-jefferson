/**
 * Declaratively initializes routes in an express app
 */
const Configuration = require('./domain/configuration');
const debug = require('debug')('jefferson');
const express = require('express');
const AppSectionClasses = [
    require('./domain/appsection/locals'),
    require('./domain/appsection/toggles'),
    require('./domain/appsection/settings'),
    require('./domain/appsection/engines'),
    require('./domain/appsection/resolvers'),
    require('./domain/appsection/routes'),
];

/**
 * Main jefferson entry point.
 * @param app
 * @param conf
 */
function jefferson(app, conf) {
    if (!app) {
        throw new Error('app parameter must be supplied');
    }
    if (!conf) {
        throw new Error('application configuration must be supplied');
    }
    const configuration = new Configuration(conf);
    AppSectionClasses.map((Type) => {
        debug(`configuring ${Type.name}`);
        new Type(app, configuration).configure();
    });
}

/**
 * Static helper function that creates a new express app from scratch, then binds the config.
 * @param conf
 */
jefferson.app = function app(conf) {
    debug('Creating new jefferson app with config');
    const a = express();
    this(a, conf);
    return a;
};

/**
 * Static helper function that creates a new express Router, then binds the config.
 * @param conf
 */
jefferson.router = function router(conf) {
    debug('Creating new jefferson Router with config');
    /*eslint-disable new-cap*/
    const r = express.Router();
    this(r, conf);
    return r;
};

module.exports = jefferson;
