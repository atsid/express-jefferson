/**
 * Safe HTTP Methods
 */
const SAFE_METHODS = {
    get: true,
    head: true,
    options: true,
};

/**
 * Composes a middleware chain by taking a core chain and adding boilerplate pre and post sections
 * to it
 */
module.exports = {
    compose(rawMethod, middleware, conf) {
        const method = rawMethod.toLowerCase();
        let result = [];
        const isSafe = () => SAFE_METHODS[method];
        const add = (x=[]) => result = result.concat(x);

        add(conf.pre.all);
        add(isSafe() ? conf.pre.safe : conf.pre.unsafe);
        add(conf.pre.method[method]);
        add(middleware);
        add(conf.post.method[method]);
        add(isSafe() ? conf.post.safe : conf.post.unsafe);
        add(conf.post.all);
        return result;
    },
};
