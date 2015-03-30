"use strict";

let chai = require("chai");
let expect = chai.expect;
let SettingsConfig = require("./settings");

describe("The settings configuration section", () => {
    it("can configure app settings", () => {
        let settings = {};
        let app = {
            set (key, value) {
                settings[key] = value;
            }
        };
        let conf = {
            settings: {
                "a": true,
                "b": "abc"
            }
        };

        new SettingsConfig(app, conf).configure();
        expect(settings.a).to.be.true;
        expect(settings.b).to.equal("abc");
    });
});
