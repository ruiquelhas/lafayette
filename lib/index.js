'use strict';

const Fs = require('fs');

const Hoek = require('hoek');
const Thurston = require('thurston');

exports.validate = async function (payload, options) {

    const items = Object.keys(Object.assign({}, payload));
    const transformed = {};

    for (const item of items) {
        const fileStructure = Object.assign({}, payload[item]);

        if ((Hoek.contain(fileStructure, ['bytes', 'filename', 'headers', 'path']))) {
            // Read the first 4100 bytes which get used by `file-type`.
            transformed[item] = Fs.createReadStream(fileStructure.path, { start: 0, end: 4100 });
        }
    }

    return await Thurston.validate(transformed, options);
};
