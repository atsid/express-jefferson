var proxy = require('./trace-logger'),
    chai = require('chai'),
    expect = chai.expect;

describe('The trace logger proxy', () => {
    it('throws an error when the delegate function is not defined', () => {
        expect(() => proxy.init()).to.throw();
    });

    it('can safely invoke a delegate', (done) => {
        let middleware = (req, res, next) => {
            req.result = 'coffee';
            next();
        };
        let wrappedMiddleware = proxy.init(middleware, undefined, 0);
        let req = {};
        wrappedMiddleware(req, {}, () => {
            expect(req.result).to.equal('coffee');
            done()
        });
    });

    it('can safely invoke a delegate when configured with a logger name', (done) => {
        let middleware = (req, res, next) => {
            req.result = 'coffee';
            next();
        };
        let wrappedMiddleware = proxy.init(middleware, { logger: 'derp' }, 0);
        let req = {};
        wrappedMiddleware(req, {}, () => {
            expect(req.result).to.equal('coffee');
            done()
        });
    });
});