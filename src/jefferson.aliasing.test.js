"use strict";
var chai = require("chai"),
    express = require("express"),
    request = require("supertest"),
    jefferson = require("./jefferson");
let expect = chai.expect;

describe("Jefferson Alias Configuration", () => {

    it("throws if a subchain reference is undefined", () => {
        let conf = {
            aliases: {
                "derp": []
            },
            routes: {
                "/test-item": {
                    get: [
                        (req, res, next) => {
                            req.entity = {id: 1};
                            next();
                        },
                        "processAndReturn"
                    ]
                }
            }
        };

        let app = express();
        expect(() => jefferson(app, conf)).to.throw();
    });

    it("throws if a alias section is undefined and an alias is referenced", () => {
        let conf = {
            routes: {
                "/test-item": {
                    get: [
                        (req, res, next) => {
                            req.entity = {id: 1};
                            next();
                        },
                        "processAndReturn"
                    ]
                }
            }
        };

        let app = express();
        expect(() => jefferson(app, conf)).to.throw();
    });

    it("can reference subchain aliases", (done) => {
        let conf = {
            aliases: {
                processAndReturn: [
                    (req, res, next) => {
                        req.entity.herp = "derp";
                        next();
                    },
                    (req, res) => {
                        res.json(req.entity);
                    }
                ]
            },
            routes: {
                "/test-item": {
                    "get": [
                        (req, res, next) => {
                            req.entity = {id: 1};
                            next();
                        },
                        "processAndReturn"
                    ]
                }
            }
        };

        let app = express();
        jefferson(app, conf);

        request(app)
            .get("/test-item")
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                expect(res.body.id).to.equal(1);
                expect(res.body.herp).to.equal("derp");
                done();
            });
    });

    it("can reference subchain aliases while the promise proxy is enabled", (done) => {
        let conf = {
            proxies: [require("../src/proxies/promise-handler")],
            aliases: {
                processAndReturn: [
                    (req, res, next) => {
                        req.entity.herp = "derp";
                        next();
                    },
                    (req, res) => {
                        res.json(req.entity);
                    }
                ]
            },
            routes: {
                "/test-item": {
                    get: [
                        (req, res, next) => {
                            req.entity = {id: 1};
                            next();
                        },
                        "processAndReturn"
                    ]
                }
            }
        };

        let app = express();
        jefferson(app, conf);

        request(app)
            .get("/test-item")
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                expect(res.body.id).to.equal(1);
                expect(res.body.herp).to.equal("derp");
                done();
            });
    });
});
