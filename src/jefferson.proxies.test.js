const {expect} = require('chai');
const express = require('express');
const request = require('supertest');
const jefferson = require('./jefferson');

describe('Jefferson Proxies', () => {
    it('can configure handlers with proxies', (done) => {
        let aTriggered = 0;
        let bTriggered = 0;
        let initialMiddlewareTriggered = false;
        let endMiddlewareTriggered = false;
        const tripA = {
            init(delegate) {
                return (req, res, next) => {
                    aTriggered++;
                    delegate(req, res, next);
                };
            },
        };
        const tripB = {
            init(delegate) {
                return (req, res, next) => {
                    bTriggered++;
                    delegate(req, res, next);
                };
            },
        };
        const conf = {
            proxies: [tripA, tripB],
            routes: {
                '/test-path': {
                    'get': [
                        (req, res, next) => {
                            initialMiddlewareTriggered = true;
                            next();
                        },
                        (req, res) => {
                            endMiddlewareTriggered = true;
                            res.send('hello!');
                        },
                    ],
                },
            },
        };

        const app = express();
        jefferson(app, conf);

        request(app)
            .get('/test-path')
            .expect('Content-Type', /text/)
            .expect('Content-Length', '6')
            .expect(200)
            .end((err) => {
                if (err) {
                    return done(err);
                }
                expect(aTriggered).to.equal(2);
                expect(bTriggered).to.equal(2);
                expect(initialMiddlewareTriggered).to.be.true;
                expect(endMiddlewareTriggered).to.be.true;
                done();
            });
    });

    it('handles the case when there are no proxies in the proxy array', (done) => {
        let initialMiddlewareTriggered = true;
        let endMiddlewareTriggered = false;

        const conf = {
            proxies: [],
            routes: {
                '/test-path': {
                    'get': [
                        (req, res, next) => {
                            initialMiddlewareTriggered = true;
                            next();
                        },
                        (req, res) => {
                            endMiddlewareTriggered = true;
                            res.send('hello!');
                        },
                    ],
                },
            },
        };

        const app = express();
        jefferson(app, conf);

        request(app)
            .get('/test-path')
            .expect('Content-Type', /text/)
            .expect('Content-Length', '6')
            .expect(200)
            .end((err) => {
                if (err) {
                    return done(err);
                }
                expect(initialMiddlewareTriggered).to.be.true;
                expect(endMiddlewareTriggered).to.be.true;
                done();
            });
    });

    it('invokes proxies with a middleware index', (done) => {
        let invocations = '';
        const conf = {
            proxies: [
                {
                    init: (delegate, proxyConf, index) => {
                        return (req, res, next) => {
                            invocations = invocations + index;
                            delegate(req, res, next);
                        };
                    },
                },
            ],
            routes: {
                '/test-path': {
                    'get': [
                        (req, res, next) => next(),
                        (req, res, next) => next(),
                        (req, res) => res.send('hello!'),
                    ],
                },
            },
        };

        const app = express();
        jefferson(app, conf);

        request(app)
            .get('/test-path')
            .expect(200)
            .end((err) => {
                if (err) {
                    return done(err);
                }
                expect(invocations).to.equal('012');
                done();
            });
    });
});
