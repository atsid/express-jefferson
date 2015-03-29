"use strict";

let initializeProxy = (proxy, delegate, index) => {
    return proxy.init(delegate, proxy.conf, index);
};

/**
 * Wraps a single middleware function in the configured proxy chain
 * @param delegate The delegate function
 * @param conf The application configuration
 * @returns {*}
 */
let proxyWrap = (delegate, index, conf) => {
    let proxies = conf.proxies;
    if (!proxies.length) { return delegate; }

    let lastProxy = initializeProxy(proxies[proxies.length - 1], delegate, index);
    for (let i = proxies.length - 2; i >= 0; i--) {
        lastProxy = initializeProxy(proxies[i], lastProxy, index);
    }
    return lastProxy;
};

module.exports = {
    process (middleware, conf) {
        return middleware.map((fn, index) => proxyWrap(fn, index, conf));
    }
};
