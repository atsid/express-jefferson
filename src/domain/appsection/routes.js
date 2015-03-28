"use strict";
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
        debug(`wiring ${routeNames.length} routes`);
        routeNames.forEach((routeName) => this.wireRoute(routeName, this.conf.routes[routeName]));
    }


    /**
     * Configures a single route in the express app/router.
     * @param routeName The name of the route
     * @param route The route configuration
     */
    wireRoute (routeName, route) {
        let method = route.method.toLowerCase();
        let path = route.path;
        let middleware = this.getMiddleware(route);
        middleware = this.configureMiddleware(middleware);
        debug(`routing ${routeName} - ${method} ${path} - ${middleware.length} middlewares`);
        this.app[method](path, middleware);
    }


    /**
     * Wraps a single middleware function with the proxy chain
     * @param delegate The middleware function we are proxying
     * @param index The index of the middleware function in the chain
     * @returns {*} A proxied function to use in express
     */
    wrapInProxies (delegate, index) {
        let proxies = this.conf.proxies;
        if (!proxies.length) {
            return delegate;
        }
        let initProxy = (proxy, delegate) => {
            return proxy.init(delegate, proxy.config, index);
        };
        let lastProxy = initProxy(proxies[proxies.length - 1], delegate);
        for (let i = proxies.length - 2; i >= 0; i--) {
            lastProxy = initProxy(proxies[i], lastProxy);
        }
        return lastProxy;
    }

    /**
     * Resolves alias references in a middleware cahin
     * @param middleware
     */
    resolveAliases (middleware) {
        let isAlias = (x) => typeof x === "string";
        for (let i = middleware.length - 1; i >= 0; i--) {
            if (isAlias(middleware[i])) {
                middleware.splice.apply(middleware, [i, 1].concat(this.conf.getAlias(middleware[i])));
            }
        }
    }

    /**
     * Configures a middleware chain
     * @param middleware An array of middleware functions
     * @returns {*} An array of middleware functions
     */
    configureMiddleware (middleware) {
        this.resolveAliases(middleware);
        return middleware.map(this.wrapInProxies, this);
    }

    getMiddleware (route) {
        let result = [];
        let add = (x) => result = result.concat(x);
        let routeMethod = route.method.toLowerCase();
        let safeMethods = {
            get: true,
            head: true,
            options: true
        };
        let isSafe = () => safeMethods[routeMethod];

        add(this.conf.pre.all);
        add(isSafe() ? this.conf.pre.safe : this.conf.pre.unsafe);
        if (this.conf.pre.method[routeMethod]) {
            add(this.conf.pre.method[routeMethod]);
        }

        add(route.middleware);
        if (this.conf.post.method[routeMethod]) {
            add(this.conf.post.method[routeMethod]);
        }
        add(isSafe() ? this.conf.post.safe : this.conf.post.unsafe);
        add(this.conf.post.all);

        return result;
    }
}

module.exports = Routes;
