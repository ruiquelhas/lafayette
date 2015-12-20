# lafayette
Route-level file type validation for [hapi](https://github.com/hapijs/hapi) parsed `multipart/form-data` temporary file request payloads.
Also works as a standalone module, and most importantly, works in tandem with [thurston](https://github.com/ruiquelhas/thurston) for a truly magical experience.

[![NPM Version][fury-img]][fury-url] [![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url] [![Dependencies][david-img]][david-url]

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
    - [`validate(payload, options, fn)`](#validatepayload-options-fn)
        - [Hapi](#hapi)
        - [Standalone](#standalone)
- [Supported File Types](#supported-file-types)

## Installation
Install via [NPM](https://www.npmjs.org).

```sh
$ npm install lafayette
```

## Usage

### `validate(payload, options, fn)`

Validates all values in a `payload` that match the hapi temporary file pattern object given a `whitelist` of file types provided in the `options`.
Results in a [joi](https://github.com/hapijs/joi)-like `ValidationError` if some file type is not allowed or unknown otherwise it returns the original parsed payload to account for additional custom validation.

#### Hapi

```js
const Hapi = require('hapi');
const Lafayette = require('lafayette');

server = new Hapi.Server();

server.connection({
    routes: {
        validate: {
            options: {
                whitelist: ['png']
            }
        }
    }
});

server.route({
    config: {
        validate: {
            payload: Lafayette.validate
        },
        payload: {
            output: 'file',
            parse: true
        }
    }
});
```

### Standalone

```js
const fs = require('fs');
const Lafayette = require('lafayette');

const options = { whitelist: ['png'] };

fs.createWriteStream('file.png').end(new Buffer([0x89, 0x50]));
const png = {
    filename: 'file.png',
    path: '.',
    headers: {
      'content-disposition': 'form-data; name="file"; filename="file.png"',
      'content-type': 'image/png'
    },
    bytes: 2
};

Lafayette.validate({ file: png }, options, (err, value) => {

    console.log(err); // null
    console.log(value); // { file: { filename: 'file.png', path: '.', ... } }
});

fs.createWriteStream('file.gif').end(new Buffer([0x47, 0x49]));
const gif = {
    filename: 'file.gif',
    path: '.',
    headers: {
      'content-disposition': 'form-data; name="file"; filename="file.gif"',
      'content-type': 'image/gif'
    },
    bytes: 2
};

Lafayette.validate({ file: gif }, options, (err, value) => {

    console.log(err); // [ValidationError: child "file" fails because ["file" type is not allowed]]
    console.log(value); // undefined
});
```

## Supported File Types

The same as [magik](https://github.com/ruiquelhas/magik#supported-file-types).

[coveralls-img]: https://coveralls.io/repos/ruiquelhas/lafayette/badge.svg
[coveralls-url]: https://coveralls.io/github/ruiquelhas/lafayette
[david-img]: https://david-dm.org/ruiquelhas/lafayette.svg
[david-url]: https://david-dm.org/ruiquelhas/lafayette
[fury-img]: https://badge.fury.io/js/lafayette.svg
[fury-url]: https://badge.fury.io/js/lafayette
[travis-img]: https://travis-ci.org/ruiquelhas/lafayette.svg
[travis-url]: https://travis-ci.org/ruiquelhas/lafayette
