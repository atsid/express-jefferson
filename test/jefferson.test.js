'use strict';

var chai = require('chai'),
    expect = require('chai').expect,
    express = require('express'),
    request = require('supertest'),
    jefferson = require('../src/jefferson'),
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
                        middleware: [
                            function () {}
                        ]
                    },
                    'getItem': {
                        method: 'GET',
                        path: '/test-path/:id',
                        middleware: [
                            function () {}
                        ]
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
        let aTriggered = false, bTriggered = false, coreHandlerTriggered = false;
        let tripA = {
            init (delegate) {
                return (req, res, next) => {
                    aTriggered = true;
                    delegate(req, res, next);
                };
            }
        };
        let tripB = {
            init (delegate) {
                return (req, res, next) => {
                    bTriggered = true;
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
                        function (req, res) {
                            coreHandlerTriggered = true;
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
                expect(aTriggered).to.be.true;
                expect(bTriggered).to.be.true;
                expect(coreHandlerTriggered).to.be.true;
                done();
            });
    });
});
