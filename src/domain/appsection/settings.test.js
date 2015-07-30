const {expect} = require('chai');
const SettingsConfig = require('./settings');

describe('The settings configuration section', () => {
    it('can configure app settings', () => {
        const settings = {};
        const app = {
            set(key, value) {
                settings[key] = value;
            },
        };
        const conf = {
            settings: {
                'a': true,
                'b': 'abc',
            },
        };

        new SettingsConfig(app, conf).configure();
        expect(settings.a).to.be.true;
        expect(settings.b).to.equal('abc');
    });
});
