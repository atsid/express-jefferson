const proxy = require('./promise-handler');
const {expect, assert} = require('chai');

describe('The promise handler proxy', () => {
    it('can resolve a promise-providing handler', (done) => {
        const middleware = (req) => {
            return Promise.resolve('coffee')
                .then((result) => req.result = result);
        };

        const wrappedMiddleware = proxy.init(middleware);
        const req = {};
        wrappedMiddleware(req, {}, () => {
            expect(req.result).to.equal('coffee');
            done();
        });
    });

    it('passes over a non promise-based middleware', (done) => {
        const middleware = (req, res, next) => next('coffee');
        const wrappedMiddleware = proxy.init(middleware);
        wrappedMiddleware({}, {}, (arg) => {
            expect(arg).to.equal('coffee');
            done();
        });
    });

    it('can correctly handle a middleware function that returns values', (done) => {
        const middleware = () => true;
        const wrappedMiddleware = proxy.init(middleware);
        wrappedMiddleware({}, {}, () => done());
    });

    it('can handle when a middleware returns a promise, yet invokes next on its own', (done) => {
        const middleware = (req, res, next) => {
            return Promise.resolve(true)
                .then(() => req.result = 'coffee')
                .then(() => next());
        };
        const wrappedMiddleware = proxy.init(middleware);
        wrappedMiddleware({}, {}, () => done());
    });

    it('middlewares can halt flow of next()', () => {
        const middleware = (req, res) => {
            return Promise.resolve(true)
                .then(() => res.complete = true);
        };
        const wrappedMiddleware = proxy.init(middleware, {
            haltCondition: (req, res) => res.complete,
        });
        return wrappedMiddleware({}, {}, () => assert.fail(0, 0, 'did not expect next to be invoked'));
    });

    it('throws an error when the delegate function is not defined', () => {
        expect(() => proxy.init()).to.throw();
    });

    it('can promisify an async handler', function canPromisifyAsyncHandler(done) {
        this.timeout(5000);
        const delegate = (req, res, next) => {
            setTimeout(() => {
                req.result = 'Hello';
                next();
            }, 250);
        };
        const promisified = proxy.promisify(delegate);
        const req = {};
        let nextCalled = false;
        const next = () => nextCalled = true;
        promisified(req, {}, next)
        .then(() => {
            expect(nextCalled).to.be.true;
            expect(req.result).to.equal('Hello');
            done();
        });
    });

    it('can handle caught errors from an async handler', function canHandleCaughtErrorsFromAsyncHandler(done) {
        this.timeout(5000);
        const delegate = (req, res, next) => {
            setTimeout(() => {
                next(new Error('DERP'));
            }, 250);
        };
        const promisified = proxy.promisify(delegate);
        promisified({}, {}, () => {})
        .then(() => { throw new Error('Did not expect promise to resolve'); })
        .catch((err) => {
            expect(err).to.be.ok;
            done();
        });
    });
});
