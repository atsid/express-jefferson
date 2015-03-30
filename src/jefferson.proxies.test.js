"use strict";
var chai = require("chai"),
    express = require("express"),
    request = require("supertest"),
    jefferson = require("./jefferson");
let expect = chai.expect;

describe("Jefferson Proxies", () => {
    it("can configure handlers with proxies", (done) => {
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
                "/test-path": {
                    "get": [
                        (req, res, next) => {
                            initialMiddlewareTriggered = true;
                            next();
                        },
                        (req, res) => {
                            endMiddlewareTriggered = true;
                            res.send("hello!");
                        }
                    ]
                }
            }
        };

        let app = express();
        jefferson(app, conf);

        request(app)
            .get("/test-path")
            .expect("Content-Type", /text/)
            .expect("Content-Length", "6")
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

    it("handles the case when there are no proxies in the proxy array", (done) => {
        let initialMiddlewareTriggered = true,
            endMiddlewareTriggered = false;

        let conf = {
            proxies: [],
            routes: {
                "/test-path": {
                    "get": [
                        (req, res, next) => {
                            initialMiddlewareTriggered = true;
                            next();
                        },
                        (req, res) => {
                            endMiddlewareTriggered = true;
                            res.send("hello!");
                        }
                    ]
                }
            }
        };

        let app = express();
        jefferson(app, conf);

        request(app)
            .get("/test-path")
            .expect("Content-Type", /text/)
            .expect("Content-Length", "6")
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

    it("invokes proxies with a middleware index", (done) => {
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
                "/test-path": {
                    "get": [
                        (req, res, next) => next(),
                        (req, res, next) => next(),
                        (req, res) => res.send("hello!")
                    ]
                }
            }
        };

        let app = express();
        jefferson(app, conf);

        request(app)
            .get("/test-path")
            .expect(200)
            .end((err) => {
                if (err) {
                    return done(err);
                }
                expect(invocations).to.equal("012");
                done();
            });
    });
});
