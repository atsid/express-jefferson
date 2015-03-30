"use strict";
var chai = require("chai"),
    express = require("express"),
    jefferson = require("./jefferson");
let expect = chai.expect;

describe("Jefferson", () => {

    it("throws an error if an express app is not provided", () => {
        expect(() => jefferson(null, {})).to.throw();
    });

    it("throws an error if an application config is not provided", () => {
        expect(() => jefferson(express())).to.throw();
    });

    it("configures an application", () => {
        let conf = {
                routes: {
                    "/test-path": {
                        get: [() => {}]
                    },
                    "/test-path/:id": {
                        get: [() => {}],
                        post: [() => {}],
                        put: [() => {}]
                    }
                }
            },
            app = express();

        jefferson(app, conf);
        /*eslint-disable*/
        let appRoutes = app._router.stack.filter((it) => it.route);
        /*eslint-enable*/
        expect(appRoutes.length).to.equal(2);
        expect(appRoutes[0].route.methods.get).to.be.true;
        expect(appRoutes[1].route.methods.get).to.be.true;
        expect(appRoutes[1].route.methods.post).to.be.true;
        expect(appRoutes[1].route.methods.put).to.be.true;
    });

    it("will throw with an older configuration", () => {
        let conf = {
                routes: {
                    "getCollection": {
                        method: "GET",
                        path: "/test-path",
                        middleware: [ () => {} ]
                    },
                    "getItem": {
                        method: "GET",
                        path: "/test-path/:id",
                        middleware: [ () => {} ]
                    }
                }
            },
            app = express();

        expect(() => jefferson(app, conf)).to.throw();
    });
});
