const chainProcessor = require('./chain_processor');
const middlewareComposer = require('./middleware_composer');
const debug = require('debug')('jefferson');

/**
 * Configures routes within the express app.
 */
class Routes {
    constructor(app, conf) {
        this.app = app;
        this.conf = conf;
    }

    configure() {
        const routeNames = Object.keys(this.conf.routes);
        debug(`detected ${routeNames.length} routing paths`);
        routeNames.forEach((routeName) => {
            const route = this.conf.routes[routeName];
            this.wireRoute(routeName, route);
        });
    }

    getMiddlewareChain(method, middleware) {
        const composed = middlewareComposer.compose(method, middleware, this.conf);
        return chainProcessor.process(composed, this.conf);
    }

    /**
     * Configures a single route in the express app/router.
     * @param routePath The route's path
     * @param routeMethods The route configuration
     */
    wireRoute(routePath, routeMethods) {
        if (routeMethods.method || routeMethods.path) {
            throw new Error('older-style routes detected. please check the documentation for the new routing style.');
        }
        let router = this.app.route(routePath);
        Object.keys(routeMethods).forEach((method) => {
            const middleware = this.getMiddlewareChain(method, routeMethods[method]);
            debug(`'${method.toUpperCase()} ${routePath} - ${middleware.length} middlewares`);
            router = router[method](middleware);
        });
    }
}

module.exports = Routes;
