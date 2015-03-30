"use strict";

let chai = require("chai");
let expect = chai.expect;
let ToggleConfig = require("./toggles");

describe("The settings-toggle configuration section", () => {
    it("can enable app features", () => {
        let enabled = {};
        let app = {
            enable (feature) {
                enabled[feature] = true;
            }
        };
        let conf = {
            enable: ["derp"],
            disable: []
        };

        new ToggleConfig(app, conf).configure();
        expect(enabled.derp).to.be.true;
    });

    it("can disable app features", () => {
        let disabled = {};
        let app = {
            disable (feature) {
                disabled[feature] = true;
            }
        };
        let conf = {
            disable: ["derp"],
            enable: []
        };

        new ToggleConfig(app, conf).configure();
        expect(disabled.derp).to.be.true;
    });
});
