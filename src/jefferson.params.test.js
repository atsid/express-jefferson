const {expect} = require('chai');
const express = require('express');
const request = require('supertest');
const jefferson = require('./jefferson');

describe('Jefferson Parameter Resolution', () => {
    it('can resolve path parameters', (done) => {
        const conf = {
            params: {
                userId: (req, res, next, id) => {
                    req.user = { id: id, name: 'derp' };
                    next();
                },
            },
            routes: {
                '/users/:userId': {
                    'get': [
                        (req, res) => { res.json(req.user); },
                    ],
                },
            },
        };

        const app = express();
        jefferson(app, conf);

        request(app)
            .get('/users/1')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) { return done(err); }
                expect(res.body.id).to.equal('1');
                expect(res.body.name).to.equal('derp');
                done();
            });
    });
});
