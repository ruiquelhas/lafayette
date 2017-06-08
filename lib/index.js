'use strict';

const Fs = require('fs');

const Hoek = require('hoek');
const Thurston = require('thurston');
const Items = require('items');

const internals = {};

internals.validate = function (payload, accumulator) {

    const keys = ['bytes', 'filename', 'headers', 'path'];

    return function (item, next) {

        const tmpfileStructure = payload[item];

        if (typeof tmpfileStructure !== 'object' || !(Hoek.contain(tmpfileStructure, keys))) {
            return next();
        }

        // Read the first 4100 bytes which get used by `file-type`.
        accumulator[item] = Fs.createReadStream(tmpfileStructure.path, { start: 0, end: 4100 });

        next();
    };
};

exports.validate = function (payload, options, next) {

    const items = Object.keys(Object.assign({}, payload));
    const result = {};
    const iterator = internals.validate(payload, result);

    Items.serial(items, iterator, () => {

        Thurston.validate(result, options, (err) => {

            if (err) {
                return next(err);
            }

            next(null, payload);
        });
    });
};
