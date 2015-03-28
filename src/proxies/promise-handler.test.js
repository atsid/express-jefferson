"use strict";
var proxy = require("./promise-handler"),
    chai = require("chai");
let expect = chai.expect;

describe("The promise handler proxy", () => {
    it("can resolve a promise-providing handler", (done) => {
        let middleware = (req) => {
            return Promise.resolve("coffee")
                .then((result) => req.result = result);
        };

        let wrappedMiddleware = proxy.init(middleware);
        let req = {};
        wrappedMiddleware(req, {}, () => {
            expect(req.result).to.equal("coffee");
            done();
        });
    });

    it("passes over a non promise-based middleware", (done) => {
        let middleware = (req, res, next) => next("coffee");
        let wrappedMiddleware = proxy.init(middleware);
        wrappedMiddleware({}, {}, (arg) => {
            expect(arg).to.equal("coffee");
            done();
        });
    });

    it("can correctly handle a middleware function that returns values", (done) => {
        let middleware = () => true;
        let wrappedMiddleware = proxy.init(middleware);
        wrappedMiddleware({}, {}, () => done());
    });

    it("can handle when a middleware returns a promise, yet invokes next on its own", (done) => {
        let middleware = (req, res, next) => {
            return Promise.resolve(true)
                .then(() => req.result = "coffee")
                .then(() => next());
        };
        let wrappedMiddleware = proxy.init(middleware);
        wrappedMiddleware({}, {}, () => done());
    });

    it("middlewares can halt flow of next()", () => {
        let middleware = (req, res) => {
            return Promise.resolve(true)
                .then(() => res.complete = true);
        };
        let wrappedMiddleware = proxy.init(middleware, {
            haltCondition: (req, res) => res.complete
        });
        return wrappedMiddleware({}, {}, () => chai.assert.fail(0, 0, "did not expect next to be invoked"));
    });

    it("throws an error when the delegate function is not defined", () => {
        expect(() => proxy.init()).to.throw();
    });

    it("can promisify an async handler", function (done) {
        this.timeout(5000);
        let delegate = (req, res, next) => {
            setTimeout(() => {
                req.result = "Hello";
                next();
            }, 250);
        };
        let promisified = proxy.promisify(delegate);
        let req = {};
        let nextCalled = false;
        let next = () => nextCalled = true;
        promisified(req, {}, next)
        .then(() => {
            expect(nextCalled).to.be.true;
            expect(req.result).to.equal("Hello");
            done();
        });
    });

    it("can handle caught errors from an async handler", function (done) {
        this.timeout(5000);
        let delegate = (req, res, next) => {
            setTimeout(() => {
                next(new Error("DERP"));
            }, 250);
        };
        let promisified = proxy.promisify(delegate);
        promisified({}, {}, () => {})
        .then(() => { throw new Error("Did not expect promise to resolve"); })
        .catch((err) => {
            expect(err).to.be.ok;
            done();
        });
    });
});
