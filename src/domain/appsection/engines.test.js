const {expect} = require('chai');
const EngineConfig = require('./engines');

describe('The \'engines\' configuration section', () => {
    it('can configure templating engines for an app', () => {
        const engines = {};
        const app = {
            engine(ext, callback) {
                engines[ext] = callback;
            },
        };
        const conf = {
            engines: {
                'jade': () => 'derp',
            },
        };

        new EngineConfig(app, conf).configure();
        expect(engines.jade).to.be.a.function;
        expect(engines.jade()).to.equal('derp');
    });
});
