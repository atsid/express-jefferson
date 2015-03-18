[![Build Status](https://travis-ci.org/atsid/express-jefferson.svg?branch=master)](https://travis-ci.org/atsid/express-jefferson)
[![Coverage Status](https://coveralls.io/repos/atsid/express-jefferson/badge.svg)](https://coveralls.io/r/atsid/express-jefferson)
[![Code Climate](https://codeclimate.com/github/atsid/express-jefferson/badges/gpa.svg)](https://codeclimate.com/github/atsid/express-jefferson)
[![Dependency Status](https://david-dm.org/atsid/express-jefferson.svg)](https://david-dm.org/atsid/express-jefferson)

[![NPM](https://nodei.co/npm/express-jefferson.png)](https://nodei.co/npm/express-jefferson/)

# express-jefferson
Declarative Express Application Wiring

express-jefferson is a microlibrary for declaratively describing RESTful services. Currently, it allows you to describe your service routes as a map.

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
        routes: {
            getBeerList: {
                method: 'GET',
                path: '/beers',
                middleware: [
                    beerlist.get
                    send.json
                ]
            }
        }
    };
    
jefferson(app, conf);
...
```

## Configuration
* routes: (optional) - An map of routes by name. Each object in the map describes an endpoint to be wired. These endpoints must contain an HTTP method, a path, and an array of middleware functions.
* proxies: (optional) - An array of proxy objects invoked around all middleware functions in order. Each proxy object should have an init() function that accepts a delegate middleware function and returns a new middleware function.

## Examples
* Promise-Based Middleware Conversion
```js
{
    name: 'Promise Conversion',
    init: (delegate) => {
        return (req, res, next) => {
            if (delegate.length === 2) {
                Promise.resolve(true)
                .then(() => delegate(req, res))
                .then(() => next())
                .catch(next);
            } else {
                return delegate(req, res, next);
            }
        }
    }
}
```
## Installation

```bash
$ npm install express-jefferson --save
```
