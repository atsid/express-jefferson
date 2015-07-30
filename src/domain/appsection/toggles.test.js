const {expect} = require('chai');
const ToggleConfig = require('./toggles');

describe('The settings-toggle configuration section', () => {
    it('can enable app features', () => {
        const enabled = {};
        const app = {
            enable(feature) {
                enabled[feature] = true;
            },
        };
        const conf = {
            enable: ['derp'],
            disable: [],
        };

        new ToggleConfig(app, conf).configure();
        expect(enabled.derp).to.be.true;
    });

    it('can disable app features', () => {
        const disabled = {};
        const app = {
            disable(feature) {
                disabled[feature] = true;
            },
        };
        const conf = {
            disable: ['derp'],
            enable: [],
        };

        new ToggleConfig(app, conf).configure();
        expect(disabled.derp).to.be.true;
    });
});
