const {expect} = require('chai');
const express = require('express');
const jefferson = require('./jefferson');

describe('Jefferson', () => {
    it('throws an error if an express app is not provided', () => {
        expect(() => jefferson(null, {})).to.throw();
    });

    it('throws an error if an application config is not provided', () => {
        expect(() => jefferson(express())).to.throw();
    });

    it('configures an application', () => {
        const conf = {
            routes: {
                '/test-path': {
                    get: [() => {}],
                },
                '/test-path/:id': {
                    get: [() => {}],
                    post: [() => {}],
                    put: [() => {}],
                },
            },
        };
        const app = express();

        jefferson(app, conf);
        /*eslint-disable*/
        const appRoutes = app._router.stack.filter((it) => it.route);
        /*eslint-enable*/
        expect(appRoutes.length).to.equal(2);
        expect(appRoutes[0].route.methods.get).to.be.true;
        expect(appRoutes[1].route.methods.get).to.be.true;
        expect(appRoutes[1].route.methods.post).to.be.true;
        expect(appRoutes[1].route.methods.put).to.be.true;
    });

    it('will throw with an older configuration', () => {
        const conf = {
            routes: {
                'getCollection': {
                    method: 'GET',
                    path: '/test-path',
                    middleware: [ () => {} ],
                },
                'getItem': {
                    method: 'GET',
                    path: '/test-path/:id',
                    middleware: [ () => {} ],
                },
            },
        };
        const app = express();
        expect(() => jefferson(app, conf)).to.throw();
    });
});
