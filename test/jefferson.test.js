'use strict';

var chai = require('chai'),
    expect = require('chai').expect,
    express = require('express'),
    jefferson = require('../lib/jefferson');

describe('Jefferson', () => {

    it('throws an error if an express app is not provided', () => {
        expect(() => jefferson(null, {})).to.throw();
    });

    it('throws an error if an application config is not provided', () => {
        expect(() => jefferson(express())).to.throw();
    });

    it('configures an application', () => {
        let conf = {
            routes: {
                'getCollection': {
                    method: 'GET',
                    path: '/test-path',
                    middleware: [
                        function () {
                        }
                    ]
                },
                'getItem': {
                    method: 'GET',
                    path: '/test-path/:id',
                    middleware: [
                        function () {
                        }
                    ]
                }
            }
        },
        routed = 0,
        app = {
            get: (path, middleware) => {
                routed++;
                console.log("mock application routing", path, middleware);
            }
        };

        jefferson(app, conf);
        expect(routed).to.equal(2);
    });
});
