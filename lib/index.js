'use strict';

const Fs = require('fs');

const Hoek = require('hoek');
const Thurston = require('thurston');
const Items = require('items');

const internals = {};

internals.validate = function (payload, accumulator) {

    const keys = ['bytes', 'filename', 'headers', 'path'];

    return function (item, next) {

        if (!(Hoek.contain(payload[item], keys))) {
            return next();
        }

        // Read the first 4100 bytes which get used by `file-type`.
        accumulator[item] = Fs.createReadStream(tmpfileStructure.path, { start: 0, end: 4100 });

        next();
    };
};

exports.validate = function (payload, options, next) {

    const items = Object.keys(payload);
    const res = {};
    const iterator = internals.validate(payload, res);

    Items.serial(items, iterator, () => {

        Thurston.validate(res, options, (err) => {

            if (err) {
                return next(err);
            }

            next(null, payload);
        });
    });
};
