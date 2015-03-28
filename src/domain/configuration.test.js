"use strict";
let chai = require("chai");
let expect = chai.expect;
let Configuration = require("./configuration");

describe("The configuration file", () => {
    it("throws an error if the configuration is not present", () => {
        expect(() => new Configuration()).to.throw;
    });

    it("has reasonable defaults if a configuration object is empty", () => {
        let conf = new Configuration({});
        let isEmptyObject = (sec) => {
            expect(sec).to.be.an.object;
            expect(sec).to.be.empty;
        };
        isEmptyObject(conf.routes);
        isEmptyObject(conf.params);
        isEmptyObject(conf.aliases);
        expect(conf.proxies).to.be.an.array;
        expect(conf.proxies).to.be.empty;
        expect(conf.pre).to.exist;
        expect(conf.post).to.exist;
    });
});
