"use strict";
var chai = require("chai"),
    express = require("express"),
    request = require("supertest"),
    jefferson = require("./jefferson");
let expect = chai.expect;

describe("Jefferson Parameter Resolution", () => {

    it("can resolve path parameters", (done) => {
        let conf = {
            params: {
                userId: (req, res, next, id) => {
                    req.user = { id: id, name: "derp" };
                    next();
                }
            },
            routes: {
                "getUser": {
                    method: "GET",
                    path: "/users/:userId",
                    middleware: [
                        (req, res) => { res.json(req.user); }
                    ]
                }
            }
        };

        let app = express();
        jefferson(app, conf);

        request(app)
            .get("/users/1")
            .expect("Content-Type", /json/)
            .expect(200)
            .end((err, res) => {
                if (err) { return done(err); }
                expect(res.body.id).to.equal("1");
                expect(res.body.name).to.equal("derp");
                done();
            });
    });
});
