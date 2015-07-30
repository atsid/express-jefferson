const {expect} = require('chai');
const express = require('express');
const request = require('supertest');
const jefferson = require('./jefferson');
const middleware = require('../test/middleware');

function checkRequest(invocation, expected) {
    return new Promise((resolve, reject) => {
        invocation.end((err, res) => {
            if (err) {
                return reject(err);
            }
            expect(res.text).to.equal(expected);
            resolve();
        });
    });
}

describe('Jefferson Pre/Post-Middleware', () => {
    it('can describe middleware that is invoked before all chains', () => {
        const conf = {
            pre: {
                all: [
                    middleware.append(0),
                    middleware.append(1),
                ],
            },
            routes: {
                '/test': {
                    get: [
                        middleware.append(2),
                        middleware.append(3),
                        middleware.sendResult,
                    ],
                },
            },
        };
        const app = express();
        jefferson(app, conf);
        return checkRequest(request(app).get('/test'), '0123');
    });

    it('can describe middleware that is invoked before safe and unsafe chains', () => {
        const conf = {
            post: {
                all: [middleware.sendResult],
            },
            pre: {
                all: [middleware.append('0')],
                safe: [middleware.append('I')],
                unsafe: [middleware.append('M')],
                method: {
                    get: [middleware.append(1)],
                    put: [middleware.append(2)],
                    post: [middleware.append(3)],
                    'delete': [middleware.append(4)],
                    options: [middleware.append(5)],
                },
            },
            routes: {
                '/test': {
                    'get': [middleware.append('GET')],
                    'head': [middleware.append('HEAD')],
                    'options': [middleware.append('OPTIONS')],
                    'put': [middleware.append('PUT')],
                    'post': [middleware.append('POST')],
                    'delete': [middleware.append('DELETE')],
                },
            },
        };

        const app = express();
        jefferson(app, conf);
        return Promise.all([
            checkRequest(request(app).get('/test'), '0I1GET'),
            checkRequest(request(app).options('/test'), '0I5OPTIONS'),
            checkRequest(request(app).put('/test'), '0M2PUT'),
            checkRequest(request(app).post('/test'), '0M3POST'),
            checkRequest(request(app).delete('/test'), '0M4DELETE'),
        ]);
    });

    it('can describe middleware that is invoked after all chains', () => {
        const conf = {
            post: {
                all: [
                    middleware.append('X'),
                    middleware.append('Y'),
                    middleware.sendResult,
                ],
            },
            routes: {
                '/test': {
                    'get': [
                        middleware.append('0'),
                        middleware.append('1'),
                    ],
                },
            },
        };

        const app = express();
        jefferson(app, conf);
        return checkRequest(request(app).get('/test'), '01XY');
    });

    it('can describe middleware that is invoked after safe and unsafe chains', () => {
        const conf = {
            post: {
                all: [middleware.sendResult],
                safe: [middleware.append('I')],
                unsafe: [middleware.append('M')],
                method: {
                    get: [middleware.append(1)],
                    put: [middleware.append(2)],
                    post: [middleware.append(3)],
                    'delete': [middleware.append(4)],
                    options: [middleware.append(5)],
                },
            },
            routes: {
                '/test': {
                    'get': [middleware.append('GET')],
                    'head': [middleware.append('HEAD')],
                    'options': [middleware.append('OPTIONS')],
                    'put': [middleware.append('PUT')],
                    'post': [middleware.append('POST')],
                    'delete': [middleware.append('DELETE')],
                },
            },
        };

        const app = express();
        jefferson(app, conf);
        return Promise.all([
            checkRequest(request(app).get('/test'), 'GET1I'),
            checkRequest(request(app).options('/test'), 'OPTIONS5I'),
            checkRequest(request(app).put('/test'), 'PUT2M'),
            checkRequest(request(app).post('/test'), 'POST3M'),
            checkRequest(request(app).delete('/test'), 'DELETE4M'),
        ]);
    });
});
