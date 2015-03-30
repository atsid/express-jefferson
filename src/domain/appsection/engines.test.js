"use strict";

let chai = require("chai");
let expect = chai.expect;
let EngineConfig = require("./engines");

describe("The 'engines' configuration section", () => {
    it("can configure templating engines for an app", () => {
        let engines = {};
        let app = {
            engine (ext, callback) {
                engines[ext] = callback;
            }
        };
        let conf = {
            engines: {
                "jade": () => "derp"
            }
        };

        new EngineConfig(app, conf).configure();
        expect(engines.jade).to.be.a.function;
        expect(engines.jade()).to.equal("derp");
    });
});
