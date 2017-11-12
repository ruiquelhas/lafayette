'use strict';

const Fs = require('fs');
const Os = require('os');
const Path = require('path');

const Code = require('code');
const Form = require('multi-part');
const Hapi = require('hapi');
const Lab = require('lab');

const Lafayette = require('../');

const lab = exports.lab = Lab.script();

lab.experiment('lafayette', () => {

    let goodServer;
    let badServer;
    let invalid;
    let png;

    lab.before(() => {

        goodServer = new Hapi.Server({
            routes: {
                validate: {
                    options: {
                        whitelist: ['image/png']
                    }
                }
            }
        });

        badServer = new Hapi.Server({
            routes: {
                validate: {
                    options: {}
                }
            }
        });

        const fileRoute = {
            options: {
                handler: (request) => null,
                payload: {
                    output: 'file',
                    parse: true
                },
                validate: {
                    failAction: (request, h, err) => {

                        throw err;
                    },
                    payload: Lafayette.validate
                }
            },
            method: 'POST',
            path: '/file'
        };

        const dataRoute = Object.assign({}, fileRoute, {
            options: Object.assign({}, fileRoute.options, {
                payload: {
                    output: 'data'
                }
            }),
            path: '/data'
        });

        const streamRoute = Object.assign({}, fileRoute, {
            options: Object.assign({}, fileRoute.options, {
                payload: {
                    output: 'stream'
                }
            }),
            path: '/stream'
        });

        goodServer.route(fileRoute);
        badServer.route([fileRoute, dataRoute, streamRoute]);
    });

    lab.beforeEach(() => {
        // Create invalid format file
        invalid = Path.join(Os.tmpdir(), 'invalid');

        return new Promise((resolve, reject) => {

            return Fs.createWriteStream(invalid)
                .on('error', reject)
                .end(Buffer.from('ffffffffffffffff', 'hex'), resolve);
        });
    });

    lab.beforeEach(() => {
        // Create fake png file
        png = Path.join(Os.tmpdir(), 'foo.png');

        return new Promise((resolve, reject) => {

            return Fs.createWriteStream(png)
                .on('error', reject)
                .end(Buffer.from('89504e470d0a1a0a', 'hex'), resolve);
        });
    });

    lab.test('should return error if the file type cannot be guessed', async () => {

        const form = new Form();
        form.append('file', Fs.createReadStream(invalid));
        form.append('foo', 'bar');

        const { result, statusCode } = await goodServer.inject({
            headers: form.getHeaders(),
            method: 'POST',
            payload: form.stream(),
            url: '/file'
        });

        Code.expect(statusCode).to.equal(400);
        Code.expect(result).to.include(['message', 'validation']);
        Code.expect(result.message).to.equal('child \"file\" fails because [\"file\" type is unknown]');
        Code.expect(result.validation).to.include(['source', 'keys']);
        Code.expect(result.validation.source).to.equal('payload');
        Code.expect(result.validation.keys).to.include('file');
    });

    lab.test('should return error if no whitelist is specified', async () => {

        const form = new Form();
        form.append('file', Fs.createReadStream(png));

        const { result, statusCode } = await badServer.inject({
            headers: form.getHeaders(),
            method: 'POST',
            payload: form.stream(),
            url: '/file'
        });

        Code.expect(statusCode).to.equal(400);
        Code.expect(result).to.include(['message', 'validation']);
        Code.expect(result.message).to.equal('child \"file\" fails because [\"file\" type is not allowed]');
        Code.expect(result.validation).to.include(['source', 'keys']);
        Code.expect(result.validation.source).to.equal('payload');
        Code.expect(result.validation.keys).to.include('file');
    });

    lab.test('should return control to the server if all files the payload are allowed', async () => {

        const form = new Form();
        form.append('file1', Fs.createReadStream(png));
        form.append('file2', Fs.createReadStream(png));
        form.append('foo', 'bar');

        const { statusCode } = await goodServer.inject({
            headers: form.getHeaders(),
            method: 'POST',
            payload: form.stream(),
            url: '/file'
        });

        Code.expect(statusCode).to.equal(200);
    });

    lab.test('should return control to the server if the payload is parsed as a stream', async () => {

        const { statusCode } = await badServer.inject({
            method: 'POST',
            payload: undefined,
            url: '/stream'
        });

        Code.expect(statusCode).to.equal(200);
    });

    lab.test('should return control to the server if the payload is parsed as a buffer', async () => {

        const { statusCode } = await badServer.inject({
            method: 'POST',
            payload: undefined,
            url: '/data'
        });

        Code.expect(statusCode).to.equal(200);
    });
});
