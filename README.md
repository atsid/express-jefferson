[![Build Status](https://travis-ci.org/atsid/express-jefferson.svg?branch=master)](https://travis-ci.org/atsid/express-jefferson)
[![Coverage Status](https://coveralls.io/repos/atsid/express-jefferson/badge.svg)](https://coveralls.io/r/atsid/express-jefferson)
[![Code Climate](https://codeclimate.com/github/atsid/express-jefferson/badges/gpa.svg)](https://codeclimate.com/github/atsid/express-jefferson)
[![Dependency Status](https://david-dm.org/atsid/express-jefferson.svg)](https://david-dm.org/atsid/express-jefferson)

[![NPM](https://nodei.co/npm/express-jefferson.png)](https://nodei.co/npm/express-jefferson/)

# express-jefferson
Declarative Express Application Wiring

```js
// main.js
var express = require('express'),
    jefferson = require('express-jefferson'),
    app = express(),    
    conf = {
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

## Installation

```bash
$ npm install express-jefferson --save
```
