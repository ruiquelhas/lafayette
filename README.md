# lafayette

Route-level file type validation for [hapi](https://github.com/hapijs/hapi) parsed `multipart/form-data` temporary file request payloads. Also works as a standalone module, and most importantly, works in tandem with [thurston](https://github.com/ruiquelhas/thurston) for a truly magical experience.

[![NPM Version][version-img]][version-url] [![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url] [![Dependencies][david-img]][david-url] [![Dev Dependencies][david-dev-img]][david-dev-url]

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

Validates all values in a `payload` that match the `hapi` temporary file pattern object given a `whitelist` of file types provided in the `options`. Results in a [joi](https://github.com/hapijs/joi)-like `ValidationError` if some file type is not allowed or unknown, otherwise it returns the original parsed payload to account for additional custom validation.

### Hapi

```javascript
const Hapi = require('hapi');
const Lafayette = require('lafayette');

const server = new Hapi.Server();

server.connection({
    routes: {
        validate: {
            options: {
                whitelist: ['image/png']
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

```javascript
const Fs = require('fs');
const Lafayette = require('lafayette');

const options = { whitelist: ['image/png'] };

Fs.createWriteStream('file.png').end(Buffer.from('89504e47', 'hex'));

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
```

```javascript
const Fs = require('fs');
const Lafayette = require('lafayette');

const options = { whitelist: ['image/png'] };

Fs.createWriteStream('file.gif').end(Buffer.from('47494638', 'hex'));

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

The same as [file-type](https://github.com/sindresorhus/file-type#supported-file-types).

[coveralls-img]: https://img.shields.io/coveralls/ruiquelhas/lafayette.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/ruiquelhas/lafayette
[david-img]: https://img.shields.io/david/ruiquelhas/lafayette.svg?style=flat-square
[david-url]: https://david-dm.org/ruiquelhas/lafayette
[david-dev-img]: https://img.shields.io/david/dev/ruiquelhas/lafayette.svg?style=flat-square
[david-dev-url]: https://david-dm.org/ruiquelhas/lafayette?type=dev
[version-img]: https://img.shields.io/npm/v/lafayette.svg?style=flat-square
[version-url]: https://www.npmjs.com/package/lafayette
[travis-img]: https://img.shields.io/travis/ruiquelhas/lafayette.svg?style=flat-square
[travis-url]: https://travis-ci.org/ruiquelhas/lafayette
