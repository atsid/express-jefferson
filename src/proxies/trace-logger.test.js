const proxy = require('./trace-logger');
const {expect} = require('chai');

describe('The trace logger proxy', () => {
    it('throws an error when the delegate function is not defined', () => {
        expect(() => proxy.init()).to.throw();
    });

    it('can safely invoke a delegate', (done) => {
        const middleware = (req, res, next) => {
            req.result = 'coffee';
            next();
        };
        const wrappedMiddleware = proxy.init(middleware, undefined, 0);
        const req = {};
        wrappedMiddleware(req, {}, () => {
            expect(req.result).to.equal('coffee');
            done();
        });
    });

    it('can safely invoke a delegate when configured with a logger name', (done) => {
        const middleware = (req, res, next) => {
            req.result = 'coffee';
            next();
        };
        const wrappedMiddleware = proxy.init(middleware, { logger: 'derp' }, 0);
        const req = {};
        wrappedMiddleware(req, {}, () => {
            expect(req.result).to.equal('coffee');
            done();
        });
    });
});
