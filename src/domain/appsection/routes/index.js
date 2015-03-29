"use strict";
var chainProcessor = require("./chain_processor"),
    middlewareComposer = require("./middleware_composer");
var debug = require("debug")("jefferson");

/**
 * Configures routes within the express app.
 */
class Routes {
    constructor (app, conf) {
        this.app = app;
        this.conf = conf;
    }

    configure () {
        let routeNames = Object.keys(this.conf.routes);
        debug(`detected ${routeNames.length} routes`);
        routeNames.forEach((routeName) => {
            let route = this.conf.routes[routeName];
            this.wireRoute(routeName, route);
        });
    }

    /**
     * Configures a single route in the express app/router.
     * @param routeName The name of the route
     * @param route The route configuration
     */
    wireRoute (routeName, route) {
        let method = route.method.toLowerCase();
        let path = route.path;
        let middleware = middlewareComposer.compose(route, this.conf);
        middleware = chainProcessor.process(middleware, this.conf);
        debug(`"${routeName}": ${method.toUpperCase()} ${path} - ${middleware.length} middlewares`);
        this.app[method](path, middleware);
    }
}

module.exports = Routes;
