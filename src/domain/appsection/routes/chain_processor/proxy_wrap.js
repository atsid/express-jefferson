"use strict";

/**
 * Wraps a single middleware function in the configured proxy chain
 * @param delegate The delegate function
 * @param conf The application configuration
 * @returns {*}
 */
let proxyWrap = (delegate, index, conf) => {
    let proxies = conf.proxies;
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
};

module.exports = {
    process (middleware, conf) {
        return middleware.map((fn, index) => proxyWrap(fn, index, conf));
    }
};
