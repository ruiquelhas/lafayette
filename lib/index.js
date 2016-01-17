'use strict';

const Fs = require('fs');

const Hoek = require('hoek');
const Thurston = require('thurston');
const Items = require('items');
const Some = require('lodash.some');

const internals = {
    defaults: {
        pattern: ['bytes', 'filename', 'headers', 'path']
    }
};

internals.validate = function (payload, cache) {

    const keys = internals.defaults.pattern;

    return function (item, next) {

        if (!(Hoek.contain(payload[item], keys))) {
            return next();
        }

        cache[item] = Fs.createReadStream(payload[item].path, { start: 0, end: 2 });

        next();
    };
};

exports.validate = function (payload, options, next) {

    const keys = internals.defaults.pattern;

    if (!Some(payload, (v) => Hoek.contain(v, keys))) {
        return next();
    }

    const items = Object.keys(payload);
    const res = {};
    const iterator = internals.validate(payload, res);

    Items.serial(items, iterator, () => {

        Thurston.validate(res, options, (err) => {

            if (err) {
                return next(err);
            }

            return next(null, payload);
        });
    });
};
