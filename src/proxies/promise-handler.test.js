var proxy = require('./promise-handler'),
    chai = require('chai'),
    expect = chai.expect;

describe('The promise handler proxy', () => {
    it('can resolve a promise-providing handler', (done) => {
        let middleware = (req, res) => {
            return Promise.resolve("coffee")
                .then((result) => req.result = result);
        };

        let wrappedMiddleware = proxy.init(middleware);
        let req = {};
        wrappedMiddleware(req, {}, () => {
            expect(req.result).to.equal('coffee');
            done()
        });
    });

    it('passes over a non promise-based middleware', (done) => {
        var middleware = (req, res, next) => next('coffee');
        let wrappedMiddleware = proxy.init(middleware);
        wrappedMiddleware({}, {}, (arg) => {
            expect(arg).to.equal('coffee');
            done()
        });
    });
});