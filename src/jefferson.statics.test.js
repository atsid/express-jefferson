"use strict";
var chai = require("chai"),
    express = require("express"),
    request = require("supertest"),
    jefferson = require("./jefferson");
let expect = chai.expect;

describe("Jefferson Static Functions", () => {

    let conf = {
        params: {
            userId: (req, res, next, id) => {
                req.user = { id: id, name: "derp" };
                next();
            }
        },
        routes: {
            "/users/:userId": {
                "get": [
                    (req, res) => { res.json(req.user); }
                ]
            }
        }
    };

    it("creates new app with config", (done) => {

        let app = jefferson.app(conf);

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

    it("creates new Router with config", (done) => {

        let app = express(),
            router = jefferson.router(conf);

        app.use(router);

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
