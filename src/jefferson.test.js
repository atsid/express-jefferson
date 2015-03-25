'use strict';

var chai = require('chai'),
    expect = require('chai').expect,
    express = require('express'),
    request = require('supertest'),
    jefferson = require('./jefferson'),
    debug = require('debug')('jefferson:test');

describe('Jefferson', () => {

    it('throws an error if an express app is not provided', () => {
        expect(() => jefferson(null, {})).to.throw();
    });

    it('throws an error if an application config is not provided', () => {
        expect(() => jefferson(express())).to.throw();
    });

    it('configures an application', () => {
        let conf = {
                routes: {
                    'getCollection': {
                        method: 'GET',
                        path: '/test-path',
                        middleware: [ () => {} ]
                    },
                    'getItem': {
                        method: 'GET',
                        path: '/test-path/:id',
                        middleware: [ () => {} ]
                    }
                }
            },
            routed = 0,
            app = {
                get: (path, middleware) => {
                    routed++;
                    debug("mock application routing", path, middleware);
                }
            };

        jefferson(app, conf);
        expect(routed).to.equal(2);
    });

    it('can configure handlers with proxies', (done) => {
        let aTriggered = 0,
            bTriggered = 0,
            initialMiddlewareTriggered = false,
            endMiddlewareTriggered = false;
        let tripA = {
            init (delegate) {
                return (req, res, next) => {
                    aTriggered++;
                    delegate(req, res, next);
                };
            }
        };
        let tripB = {
            init (delegate) {
                return (req, res, next) => {
                    bTriggered++;
                    delegate(req, res, next);
                };
            }
        };
        let conf = {
            proxies: [tripA, tripB],
            routes: {
                'getItem': {
                    method: 'GET',
                    path: '/test-path',
                    middleware: [
                        (req, res, next) => {
                            initialMiddlewareTriggered = true;
                            next();
                        },
                        (req, res) => {
                            endMiddlewareTriggered = true;
                            res.send('hello!');
                        }
                    ]
                }
            }
        };

        let app = express();
        jefferson(app, conf);

        request(app)
            .get('/test-path')
            .expect('Content-Type', /text/)
            .expect('Content-Length', '6')
            .expect(200)
            .end((err, res) => {
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
        let initialMiddlewareTriggered = true,
            endMiddlewareTriggered = false;

        let conf = {
            proxies: [],
            routes: {
                'getItem': {
                    method: 'GET',
                    path: '/test-path',
                    middleware: [
                        (req, res, next) => {
                            initialMiddlewareTriggered = true;
                            next();
                        },
                        (req, res) => {
                            endMiddlewareTriggered = true;
                            res.send('hello!');
                        }
                    ]
                }
            }
        };

        let app = express();
        jefferson(app, conf);

        request(app)
            .get('/test-path')
            .expect('Content-Type', /text/)
            .expect('Content-Length', '6')
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                expect(initialMiddlewareTriggered).to.be.true;
                expect(endMiddlewareTriggered).to.be.true;
                done();
            });
    });

    it('invokes proxies with a middleware index', (done) => {
        let invocations = "";
        let conf = {
            proxies: [
                {
                    init: (delegate, conf, index) => {
                        return (req, res, next) => {
                            invocations = invocations + index;
                            delegate(req, res, next);
                        };
                    }
                }
            ],
            routes: {
                'getItem': {
                    method: 'GET',
                    path: '/test-path',
                    middleware: [
                        (req, res, next) => next(),
                        (req, res, next) => next(),
                        (req, res) => res.send('hello!')
                    ]
                }
            }
        };

        let app = express();
        jefferson(app, conf);

        request(app)
            .get('/test-path')
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                expect(invocations).to.equal("012");
                done();
            });
    });

    it('can resolve path parameters', (done) => {
        let conf = {
            params: {
                userId: (req, res, next, id) => {
                    req.user = { id: id, name: 'derp' };
                    next();
                }
            },
            routes: {
                'getUser': {
                    method: 'GET',
                    path: '/users/:userId',
                    middleware: [
                        (req, res) => { res.json(req.user); }
                    ]
                }
            }
        };

        let app = express();
        jefferson(app, conf);

        request(app)
            .get('/users/1')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) { return done(err); }
                expect(res.body.id).to.equal('1');
                expect(res.body.name).to.equal('derp');
                done();
            });
    });

    it('throws if a subchain reference is undefined', () => {
        let conf = {
            aliases: {
                'derp': []
            },
            routes: {
                'getUser': {
                    method: 'GET',
                    path: '/test-item',
                    middleware: [
                        (req, res, next) => {
                            req.entity = {id: 1};
                            next();
                        },
                        'processAndReturn'
                    ]
                }
            }
        };

        let app = express();
        expect(() => jefferson(app, conf)).to.throw();
    });

    it('throws if a alias section is undefined and an alias is referenced', () => {
        let conf = {
            routes: {
                'getUser': {
                    method: 'GET',
                    path: '/test-item',
                    middleware: [
                        (req, res, next) => {
                            req.entity = {id: 1};
                            next();
                        },
                        'processAndReturn'
                    ]
                }
            }
        };

        let app = express();
        expect(() => jefferson(app, conf)).to.throw();
    });

    it('can reference subchain aliases', (done) => {
        let conf = {
            aliases: {
                processAndReturn: [
                    (req, res, next) => {
                        req.entity.herp = 'derp';
                        next();
                    },
                    (req, res) => { res.json(req.entity); }
                ]
            },
            routes: {
                'getUser': {
                    method: 'GET',
                    path: '/test-item',
                    middleware: [
                        (req, res, next) => {
                            req.entity = {id: 1};
                            next();
                        },
                        'processAndReturn'
                    ]
                }
            }
        };

        let app = express();
        jefferson(app, conf);

        request(app)
            .get('/test-item')
            .expect(200)
            .end((err, res) => {
                if (err) { return done(err); }
                expect(res.body.id).to.equal(1);
                expect(res.body.herp).to.equal('derp');
                done();
            });
    });

    it('can reference subchain aliases while the promise proxy is enabled', (done) => {
        let conf = {
            proxies: [require('../src/proxies/promise-handler')],
            aliases: {
                processAndReturn: [
                    (req, res, next) => {
                        req.entity.herp = 'derp';
                        next();
                    },
                    (req, res) => { res.json(req.entity); }
                ]
            },
            routes: {
                'getUser': {
                    method: 'GET',
                    path: '/test-item',
                    middleware: [
                        (req, res, next) => {
                            req.entity = {id: 1};
                            next();
                        },
                        'processAndReturn'
                    ]
                }
            }
        };

        let app = express();
        jefferson(app, conf);

        request(app)
            .get('/test-item')
            .expect(200)
            .end((err, res) => {
                if (err) { return done(err); }
                expect(res.body.id).to.equal(1);
                expect(res.body.herp).to.equal('derp');
                done();
            });
    });
});
