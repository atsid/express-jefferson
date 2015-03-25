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
    let proxies = conf.proxies;

    /**
     * Wraps a single middleware function with the proxy chain
     * @param delegate The middleware function we are proxying
     * @param index The index of the middleware function in the chain
     * @returns {*} A proxied function to use in express
     */
    let wrapInProxies = (delegate, index) => {
        if (!proxies || !proxies.length) {
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
    };

    /**
     * Resolves an alias reference
     * @param aliasName
     * @param middlewareChain
     */
    let resolveAlias = (aliasName) => {
        if (!conf.aliases) {
            throw new Error(`no aliases defined, cannot find ${aliasName}`);
        }
        if (!conf.aliases[aliasName]) {
            throw new Error(`could not find handler chain with alias ${aliasName}`);
        }
        return conf.aliases[aliasName];
    };

    /**
     * Resolves alias references in a middleware cahin
     * @param middleware
     */
    let resolveAliases = (middleware) => {
        let isAlias = (x) => typeof x === 'string';
        for (let i = middleware.length -1; i >= 0; i--) {
            if (isAlias(middleware[i])) {
                middleware.splice.apply(middleware, [i,1].concat(resolveAlias(middleware[i])));
            }
        }
    };

    /**
     * Configures a middleware chain
     * @param middleware An array of middleware functions
     * @returns {*} An array of middleware functions
     */
    let configureMiddleware = (middleware) => {
        resolveAliases(middleware);
        return middleware.map(wrapInProxies);
    };

    /**
     * Configures a single route in the express app/router.
     * @param routeName The name of the route
     * @param route The route configuration
     */
    let wireRoute = (routeName, route) => {
        let method = route.method.toLowerCase(),
            path = route.path,
            middleware = configureMiddleware(route.middleware);
        debug(`routing ${routeName} - ${method} ${path} - ${middleware.length} middlewares`);
        app[method](path, middleware);
    };

    /**
     * Configures all routes within the express app.
     */
    let wireRoutes = () => {
        let routeNames = Object.keys(conf.routes);
        debug(`wiring ${routeNames.length} routes`);
        routeNames.forEach((routeName) => wireRoute(routeName, conf.routes[routeName]));
    };

    /**
     * Configures the application with a parameter resolver
     * @param name The parameter name
     */
    let wireResolver = (name) => {
        debug(`wiring parameter resolver for ${name}`);
        app.param(name, conf.params[name]);
    };

    /**
     * Configures parameter resolvers for the application
     */
    let wireResolvers = () => {
        if (conf.params) {
            let resolvers = Object.keys(conf.params);
            debug(`wiring ${resolvers.length} parameter resolvers`);
            resolvers.forEach(wireResolver);
        }
    };

    wireRoutes();
    wireResolvers();
};
