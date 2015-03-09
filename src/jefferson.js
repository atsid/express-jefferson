'use strict';

/**
 * Declaratively initializes routes in an express app
 */
var debug = require('debug')('jefferson');

module.exports = (app, conf) => {
    if (!app) {
        throw new Error("app parameter must be supplied");
    }
    if (!conf) {
        throw new Error("application configuration must be supplied");
    }

    let wireRoute = (routeName, route) => {
        let method = route.method.toLowerCase(),
            path = route.path,
            middleware = route.middleware;
        //jscs:disable
        debug(`routing ${routeName} - ${method} ${path} - ${middleware.length} middlewares`);
        //jscs:enable
        app[method](path, middleware);
    },
    wireRoutes = () => {
        let routeNames = Object.keys(conf.routes);
        //jscs:disable
        debug(`wiring ${routeNames.length} routes`);
        //jscs:enable
        routeNames.forEach((routeName) => wireRoute(routeName, conf.routes[routeName]));
    };

    wireRoutes();
};
