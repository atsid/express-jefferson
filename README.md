[![Build Status](https://travis-ci.org/atsid/express-jefferson.svg?branch=master)](https://travis-ci.org/atsid/express-jefferson)
[![Coverage Status](https://coveralls.io/repos/atsid/express-jefferson/badge.svg)](https://coveralls.io/r/atsid/express-jefferson)
[![Code Climate](https://codeclimate.com/github/atsid/express-jefferson/badges/gpa.svg)](https://codeclimate.com/github/atsid/express-jefferson)
[![Dependency Status](https://david-dm.org/atsid/express-jefferson.svg)](https://david-dm.org/atsid/express-jefferson)

[![NPM](https://nodei.co/npm/express-jefferson.png)](https://nodei.co/npm/express-jefferson/)

# express-jefferson
Declarative Express Application Wiring

express-jefferson is a microlibrary for declaratively describing RESTful services.

```js
// main.js
var express = require('express'),
    jefferson = require('express-jefferson'),
    app = express(),    
    conf = {
        proxies: [
            {
                name: 'Logger',
                init (delegate) {
                    return (req, res, next) => {
                        console.log("invoking middleware function");
                        delegate(req, res, next);
                    }
                }
            }
        ],
        params: {
            beerId: (req, res, next, id) => {
                req.beer = getBeerById();
                next();
            }
        },
        routes: {
            getBeerList: {
                method: 'GET',
                path: '/beers',
                middleware: [
                    beerlist.get
                    send.json
                ]
            },
            getBeer: {
                method: 'GET',
                path: '/beers/:beerId',
                middleware: [
                    send.json
                ]
            }
        }
    };
    
jefferson(app, conf);
...
```

## Configuration
* routes - An map of routes by name. Each object in the map describes an endpoint to be wired. These endpoints must contain an HTTP method, a path, and an array of middleware functions.
* aliases: (optional) - A map of alias-name to handler chain. Routes may use these aliases in lieu of repeated function groups.
* proxies: (optional) - An array of proxy objects invoked around all middleware functions in order. Each proxy object should have an init() function that accepts a delegate middleware function and returns a new middleware function.
* params: (optional) - A map of path-parameter name to resolver functions. 

## Boilerplate Proxies
### Promise-Based Middleware Proxy 
`require('express-jefferson/proxies/promise-handler')`

This proxy accepts promise-based middleware (middleware that accepts two arguments) and wraps them in a promise chain before invoking next().

#### Config Options:
* haltCondition (optional) - a predicate function that accepts the request and response. If it returns a truthy value, then the middleware chain will be halted. 

### Trace Logger Middleware Proxy
`require('express-jefferson/proxies/trace-logger')`

This proxy logs invocations of middleware using the debug library.

#### Config Options:
 * logger (optional) - the name of the debug logger to use. Default is "jefferson:trace-logger"

## Installation

```bash
$ npm install express-jefferson --save
```
