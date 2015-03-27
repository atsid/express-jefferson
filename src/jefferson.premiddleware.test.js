"use strict";
var chai = require("chai"),
    express = require("express"),
    request = require("supertest"),
    jefferson = require("./jefferson"),
    middleware = require("../test/middleware");
let expect = chai.expect;

describe("Jefferson Pre-Middleware", () => {
    it("can describe middleware that's invoked before all chains", (done) => {
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
        request(app)
            .get("/test")
            .expect("Content-Type", /text/)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                expect(res.text).to.equal("0123");
                done();
            });
    });

    it("can describe middleware that's invoked before mutable and immutable chains", () => {
        let conf = {
            pre: {
                all: [middleware.append("0")],
                safe: [middleware.append("I")],
                unsafe: [middleware.append("M")]
            },
            routes: {
                "get": {
                    method: "GET",
                    path: "/test",
                    middleware: [
                        middleware.append("GET"),
                        middleware.sendResult
                    ]
                },
                "head": {
                    method: "HEAD",
                    path: "/test",
                    middleware: [
                        middleware.append("HEAD"),
                        middleware.sendResult
                    ]
                },
                "options": {
                    method: "OPTIONS",
                    path: "/test",
                    middleware: [
                        middleware.append("OPTIONS"),
                        middleware.sendResult
                    ]
                },
                "edit": {
                    method: "PUT",
                    path: "/test",
                    middleware: [
                        middleware.append("PUT"),
                        middleware.sendResult
                    ]
                },
                "create": {
                    method: "POST",
                    path: "/test",
                    middleware: [
                        middleware.append("POST"),
                        middleware.sendResult
                    ]
                },
                "delete": {
                    method: "DELETE",
                    path: "/test",
                    middleware: [
                        middleware.append("DELETE"),
                        middleware.sendResult
                    ]
                }
            }
        };

        let app = express();
        jefferson(app, conf);

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

        return Promise.all([
            checkRequest(request(app).get("/test"), "0IGET"),
            checkRequest(request(app).options("/test"), "0IOPTIONS"),
            //checkRequest(request(app).head("/test"), "0IHEAD"),
            checkRequest(request(app).put("/test"), "0MPUT"),
            checkRequest(request(app).post("/test"), "0MPOST"),
            checkRequest(request(app).delete("/test"), "0MDELETE")
        ]);
    });
});
