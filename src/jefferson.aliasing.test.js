const {expect} = require('chai');
const express = require('express');
const request = require('supertest');
const jefferson = require('./jefferson');
const debug = require('debug')('jefferson:aliasing');

describe('Jefferson Alias Configuration', () => {
    it('throws if a subchain reference is undefined', () => {
        const conf = {
            aliases: {
                'derp': [],
            },
            routes: {
                '/test-item': {
                    get: [
                        (req, res, next) => {
                            req.entity = {id: 1};
                            next();
                        },
                        'processAndReturn',
                    ],
                },
            },
        };

        const app = express();
        expect(() => jefferson(app, conf)).to.throw();
    });

    it('throws if a alias section is undefined and an alias is referenced', () => {
        const conf = {
            routes: {
                '/test-item': {
                    get: [
                        (req, res, next) => {
                            req.entity = {id: 1};
                            next();
                        },
                        'processAndReturn',
                    ],
                },
            },
        };

        const app = express();
        expect(() => jefferson(app, conf)).to.throw();
    });

    it('can reference subchain aliases', (done) => {
        const conf = {
            aliases: {
                processAndReturn: [
                    (req, res, next) => {
                        req.entity.herp = 'derp';
                        next();
                    },
                    (req, res) => {
                        res.json(req.entity);
                    },
                ],
            },
            routes: {
                '/test-item': {
                    'get': [
                        (req, res, next) => {
                            req.entity = {id: 1};
                            next();
                        },
                        'processAndReturn',
                    ],
                },
            },
        };

        const app = express();
        jefferson(app, conf);

        request(app)
            .get('/test-item')
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                expect(res.body.id).to.equal(1);
                expect(res.body.herp).to.equal('derp');
                done();
            });
    });

    it('can reference nested aliases', (done) => {
        const conf = {
            aliases: {
                processAndReturn: [
                    (req, res, next) => {
                        req.entity.herp = 'derp';
                        next();
                    },
                    'otherStuff',
                    (req, res) => {
                        res.json(req.entity);
                    },
                ],
                otherStuff: [
                    (req, res, next) => {
                        debug('invoking nested alias');
                        req.entity.flurp = 'merp';
                        next();
                    },
                ],
            },
            routes: {
                '/test-item': {
                    'get': [
                        (req, res, next) => {
                            req.entity = {id: 1};
                            next();
                        },
                        'processAndReturn',
                    ],
                },
            },
        };

        const app = express();
        jefferson(app, conf);

        request(app)
            .get('/test-item')
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                expect(res.body.id).to.equal(1);
                expect(res.body.herp).to.equal('derp');
                expect(res.body.flurp).to.equal('merp');
                done();
            });
    });

    it('can reference subchain aliases while the promise proxy is enabled', (done) => {
        const conf = {
            proxies: [require('../src/proxies/promise-handler')],
            aliases: {
                processAndReturn: [
                    (req, res, next) => {
                        req.entity.herp = 'derp';
                        next();
                    },
                    (req, res) => {
                        res.json(req.entity);
                    },
                ],
            },
            routes: {
                '/test-item': {
                    get: [
                        (req, res, next) => {
                            req.entity = {id: 1};
                            next();
                        },
                        'processAndReturn',
                    ],
                },
            },
        };

        const app = express();
        jefferson(app, conf);

        request(app)
            .get('/test-item')
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                expect(res.body.id).to.equal(1);
                expect(res.body.herp).to.equal('derp');
                done();
            });
    });
});
