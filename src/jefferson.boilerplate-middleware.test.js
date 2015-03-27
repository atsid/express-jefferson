"use strict";
var chai = require("chai"),
    express = require("express"),
    request = require("supertest"),
    jefferson = require("./jefferson"),
    middleware = require("../test/middleware");
let expect = chai.expect;

let checkRequest = (invocation, expected) => {
    return new Promise((resolve, reject) => {
        invocation.end((err, res) => {
            if (err) {
                return reject(err);
            }
            expect(res.text).to.equal(expected);
            resolve();
        });
    });
};

describe("Jefferson Pre/Post-Middleware", () => {
    it("can describe middleware that's invoked before all chains", () => {
        let conf = {
            pre: {
                all: [
                    middleware.append(0),
                    middleware.append(1)
                ]
            },
            routes: {
                "getItem": {
                    method: "GET",
                    path: "/test",
                    middleware: [
                        middleware.append(2),
                        middleware.append(3),
                        middleware.sendResult
                    ]
                }
            }
        };
        let app = express();
        jefferson(app, conf);
        return checkRequest(request(app).get("/test"), "0123");
    });

    it("can describe middleware that's invoked before mutable and immutable chains", () => {
        let conf = {
            post: {
                all: [middleware.sendResult]
            },
            pre: {
                all: [middleware.append("0")],
                safe: [middleware.append("I")],
                unsafe: [middleware.append("M")],
                method: {
                    get: [middleware.append(1)],
                    put: [middleware.append(2)],
                    post: [middleware.append(3)],
                    delete: [middleware.append(4)],
                    options: [middleware.append(5)]
                }
            },
            routes: {
                "get": {
                    method: "GET",
                    path: "/test",
                    middleware: [middleware.append("GET")]
                },
                "head": {
                    method: "HEAD",
                    path: "/test",
                    middleware: [middleware.append("HEAD")]
                },
                "options": {
                    method: "OPTIONS",
                    path: "/test",
                    middleware: [middleware.append("OPTIONS")]
                },
                "edit": {
                    method: "PUT",
                    path: "/test",
                    middleware: [middleware.append("PUT")]
                },
                "create": {
                    method: "POST",
                    path: "/test",
                    middleware: [middleware.append("POST")]
                },
                "delete": {
                    method: "DELETE",
                    path: "/test",
                    middleware: [middleware.append("DELETE")]
                }
            }
        };

        let app = express();
        jefferson(app, conf);
        return Promise.all([
            checkRequest(request(app).get("/test"), "0I1GET"),
            checkRequest(request(app).options("/test"), "0I5OPTIONS"),
            //checkRequest(request(app).head("/test"), "0IHEAD"),
            checkRequest(request(app).put("/test"), "0M2PUT"),
            checkRequest(request(app).post("/test"), "0M3POST"),
            checkRequest(request(app).delete("/test"), "0M4DELETE")
        ]);
    });

    it("can describe middleware that's invoked after all chains", () => {
        let conf = {
            post: {
                all: [
                    middleware.append("X"),
                    middleware.append("Y"),
                    middleware.sendResult
                ]
            },
            routes: {
                "getItem": {
                    method: "GET",
                    path: "/test",
                    middleware: [
                        middleware.append("0"),
                        middleware.append("1")
                    ]
                }
            }
        };

        let app = express();
        jefferson(app, conf);
        return checkRequest(request(app).get("/test"), "01XY");
    });

    it("can describe middleware that's invoked after mutable and immutable chains", () => {
        let conf = {
            post: {
                all: [middleware.sendResult],
                safe: [middleware.append("I")],
                unsafe: [middleware.append("M")],
                method: {
                    get: [middleware.append(1)],
                    put: [middleware.append(2)],
                    post: [middleware.append(3)],
                    delete: [middleware.append(4)],
                    options: [middleware.append(5)]
                }
            },
            routes: {
                "get": {
                    method: "GET",
                    path: "/test",
                    middleware: [middleware.append("GET")]
                },
                "head": {
                    method: "HEAD",
                    path: "/test",
                    middleware: [middleware.append("HEAD")]
                },
                "options": {
                    method: "OPTIONS",
                    path: "/test",
                    middleware: [middleware.append("OPTIONS")]
                },
                "edit": {
                    method: "PUT",
                    path: "/test",
                    middleware: [middleware.append("PUT")]
                },
                "create": {
                    method: "POST",
                    path: "/test",
                    middleware: [middleware.append("POST")]
                },
                "delete": {
                    method: "DELETE",
                    path: "/test",
                    middleware: [middleware.append("DELETE")]
                }
            }
        };

        let app = express();
        jefferson(app, conf);
        return Promise.all([
            checkRequest(request(app).get("/test"), "GET1I"),
            checkRequest(request(app).options("/test"), "OPTIONS5I"),
            //checkRequest(request(app).head("/test"), "0IHEAD"),
            checkRequest(request(app).put("/test"), "PUT2M"),
            checkRequest(request(app).post("/test"), "POST3M"),
            checkRequest(request(app).delete("/test"), "DELETE4M")
        ]);
    });
});
