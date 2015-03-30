"use strict";

let chai = require("chai");
let expect = chai.expect;
let LocalsConfig = require("./locals");

describe("The 'locals' configuration section", () => {
    it("can configure locals for an app", () => {
        let app = {
            locals: {
                herp: true
            }
        };
        let conf = {
            locals: {
                derp: true
            }
        };

        new LocalsConfig(app, conf).configure();
        expect(app.locals.derp).to.be.true;
        expect(app.locals.herp).to.be.true;
    });
});
