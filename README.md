[![Build Status](https://travis-ci.org/atsid/express-jefferson.svg?branch=master)](https://travis-ci.org/atsid/express-jefferson)
[![Test Coverage](https://codeclimate.com/github/atsid/express-jefferson/badges/coverage.svg)](https://codeclimate.com/github/atsid/express-jefferson)
[![Code Climate](https://codeclimate.com/github/atsid/express-jefferson/badges/gpa.svg)](https://codeclimate.com/github/atsid/express-jefferson)
[![Dependency Status](https://david-dm.org/atsid/express-jefferson.svg)](https://david-dm.org/atsid/express-jefferson)

[![NPM](https://nodei.co/npm/express-jefferson.png)](https://nodei.co/npm/express-jefferson/)

# express-jefferson
Declarative Express Application Wiring

express-jefferson is a library for declaratively describing RESTful services and configuring express apps.

```js
// main.js
var express = require('express'),
    jefferson = require('express-jefferson'),
    app = express(),    
    conf = {
        proxies: [logInvocations, resolvePromises],
        pre: {
            safe: [markReadOnly],
            unsafe: [authenticate]
        },
        post: {
            all: [addHaetoasLinks, transmitResponse]
        },
        params: {
            beerId: getBeerById,
            userId: getUserById
        },
        routes: {
            '/beers': {
                get: [getBeerList, send.json]
                post: [createBeer, send.json]
            },
            '/beers/:beerId': 
                get: [send.json]
                put: [editBeer, send.json]
            }
        }
    };
    
jefferson(app, conf);
```

## Configuration
* **routes** - (*required*) - A map of routes by route path. Each object in the map contains a map of method to middleware function array.
```js
routes: {
    {
        '/my-path': {
            get: [getThings, send]
            past: [makeThing, send]
        },
        '/my-path/:id': {
            get: [getThing, send]
        }
    }
}
```
* **aliases**: (*optional*) - A map of alias-name to handler chain. Routes may use these aliases in lieu of repeated function groups.
```js
aliases: {
    'processAndTransmit': [deletePassword, addHateoasLinks, transmitEntity]
},
routes: {
    '/users/:id': {
        get: [getUser, 'processAndTransmit']
    }
}
```
* **pre**: (*optional*) - (object) Boilerplate section of pre-middleware functions (see below)
* **post**: (*optional*) - (object) Boilerplate section of post-middleware functions (see below)
* **proxies**: (*optional*) - An array of proxy objects invoked around all middleware functions in order. (see below)
* **params**: (*optional*) - A map of path-parameter name to resolver functions.
```js
params: {
    userId: (req, res, next) => {
        req.user = userStore.findUser(req.params.userId);
        next();
    }
}
routes: {
    '/users/:userId': {
        get: [(req, res, next) => res.send(req.user)]
    }
}
```
* **enable**: (*optional*) - An array of settings strings to enable (http://expressjs.com/api.html#app.enable)
```js
enable: ['trust proxy', 'etag']
```
* **disable**: (*optional*) - An array of settings strings to disable (http://expressjs.com/api.html#app.disable)
```js
disable: ['trust proxy', 'etag']
```
* **engines**: (*optional*) - An map of template rendering engines. `{ <extension>: <engineFunction> }`
```js
engines: {
    'jade': require('jade').__express
}
```
* **locals**: (*optional*) - (object) An object that will populate app.locals (http://expressjs.com/api.html#app.locals) `{ <localName>: <localValue> }`
```js
locals: {
    'a': true
}
```
* **settings**: (*optional*) - (object) An object that will be iterated to populate application settings using app.set (http://expressjs.com/api.html#app.set) `{ <settingName>: <settingValue> }`
```js
settings: {
    'a': true
}
```

###Boilerplate Config Sections (pre/post):
* **all**: (*optional*) - An array of middleware to be applied to all endpoints.
* **safe**: (*optional*) - An array of middleware to be applied to all safe endpoints (GET, HEAD, OPTIONS).
* **unsafe**: (*optional*) - An array of middleware to be applied to all unsafe endpoints (not GET, HEAD, OPTIONS).
* **method**: (*optional*, object) - On object of method-name to handler list.
```js
pre: {
    all: [trackInvocation],
    unsafe: [authenticate],
    method: {
        get: [markRequestReadOnly]
    }
}
```

###Proxy Definition: 
* **name**: - The name of the proxy.
* **init**: - A function that accepts a middleware function, augments it, and returns the augmented proxy.
* **conf**: (*optional*) - A configuration object that is passed to the proxy init function.
```js
{
    name: 'Logger',
    init (delegate) {
        return (req, res, next) => {
            console.log("invoking middleware function");
            delegate(req, res, next);
        }
    }
}
```

# Proxies provided in Jefferson

## Promise-Based Middleware Proxy 
`require('express-jefferson/proxies/promise-handler')`

This proxy accepts promise-based middleware (middleware that accepts two arguments) and wraps them in a promise chain before invoking next().

### Config Options:
* haltCondition (optional) - a predicate function that accepts the request and response. If it returns a truthy value, then the middleware chain will be halted. 

## Trace Logger Middleware Proxy
`require('express-jefferson/proxies/trace-logger')`

This proxy logs invocations of middleware using the debug library.

### Config Options:
 * logger (optional) - the name of the debug logger to use. Default is "jefferson:trace-logger"
