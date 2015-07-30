const {expect} = require('chai');
const LocalsConfig = require('./locals');

describe('The \'locals\' configuration section', () => {
    it('can configure locals for an app', () => {
        const app = {
            locals: {
                herp: true,
            },
        };
        const conf = {
            locals: {
                derp: true,
            },
        };

        new LocalsConfig(app, conf).configure();
        expect(app.locals.derp).to.be.true;
        expect(app.locals.herp).to.be.true;
    });
});
