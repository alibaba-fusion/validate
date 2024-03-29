import { assert } from 'chai';
import Schema from '../src/index';

describe('validator', () => {
    it('works', (done) => {
        new Schema({
            v: [
                {
                    validator(rule, value, callback) {
                        callback(new Error('e1'));
                    },
                },
                {
                    validator(rule, value, callback) {
                        callback(new Error('e2'));
                    },
                },
            ],
            v2: [
                {
                    validator(rule, value, callback) {
                        callback(new Error('e3'));
                    },
                },
            ],
        }).validate(
            {
                v: 2,
            },
            (errors) => {
                assert(errors);
                assert(errors.length === 2);
                assert(errors[0].message === 'e1');
                assert(errors[1].message === 'e3');
                done();
            }
        );
    });

    it('should return no error when callback with undefiend/""/null', async () => {
        const schema = new Schema({
            v: [
                {
                    validator(rule, value, callback) {
                        callback();
                    },
                },
                {
                    validator(rule, value, callback) {
                        callback('');
                    },
                },
                {
                    validator(rule, value, callback) {
                        callback(null);
                    },
                },
                // {
                //     validator(rule, value, callback) {
                //         callback(false);
                //     },
                // },
            ],
            v2: [
                {
                    validator(rule, value, callback) {
                        callback();
                    },
                },
            ],
        });
        await new Promise<void>((resolve) => {
            schema.validate(
                {
                    v: 2,
                },
                (errors) => {
                    assert.equal(errors, null);
                    resolve();
                }
            );
        });
        const { errors } = await schema.validate({ v: 2 });
        assert(errors === null);
    });

    it('first works', (done) => {
        new Schema(
            {
                v: [
                    {
                        validator(rule, value, callback) {
                            callback(new Error('e1'));
                        },
                    },
                    {
                        validator(rule, value, callback) {
                            callback(new Error('e2'));
                        },
                    },
                ],
                v2: [
                    {
                        validator(rule, value, callback) {
                            callback(new Error('e3'));
                        },
                    },
                ],
            },
            { first: true }
        ).validate(
            {
                v: 2,
                v2: 1,
            },
            (errors) => {
                assert(errors);
                assert(errors.length === 1);
                assert(errors[0].message === 'e1');
                done();
            }
        );
    });

    it('passes value on resolve', (done) => {
        new Schema({
            v: [
                {
                    validator(rule, value, callback) {
                        callback(new Error('e1'));
                    },
                },
                {
                    validator(rule, value, callback) {
                        callback(new Error('e2'));
                    },
                },
            ],
            v2: [
                {
                    validator(rule, value, callback) {
                        callback(new Error('e3'));
                    },
                },
            ],
        }).validate(
            {
                v: 2,
            },
            (errors) => {
                assert(errors);
                assert(errors.length === 2);
                assert(errors[0].message === 'e1');
                assert(errors[1].message === 'e3');
                done();
            }
        );
    });
});

describe('promise validator', () => {
    it('works with reject', (done) => {
        new Schema({
            v: [
                {
                    validator() {
                        return Promise.reject(new Error('e1'));
                    },
                },
                {
                    validator() {
                        return Promise.reject(new Error('e2'));
                    },
                },
            ],
            v2: [
                {
                    validator() {
                        return Promise.reject(new Error('e3'));
                    },
                },
            ],
        }).validate(
            {
                v: 2,
            },
            (errors) => {
                assert(errors);
                assert(errors.length === 2);
                assert(errors[0].message === 'e1');
                assert(errors[1].message === 'e3');
                done();
            }
        );
    });

    it('works with resolve', (done) => {
        new Schema({
            v: [
                {
                    validator() {
                        return Promise.resolve();
                    },
                },
                {
                    validator() {
                        return Promise.resolve();
                    },
                },
            ],
            v2: [
                {
                    validator() {
                        return Promise.resolve();
                    },
                },
            ],
        }).validate(
            {
                v: 2,
            },
            (errors) => {
                assert.equal(errors, null);
                done();
            }
        );
    });

    it('should return null when no errors', (done) => {
        new Schema({
            v: [
                {
                    validator() {
                        return Promise.resolve();
                    },
                },
                {
                    validator() {
                        return Promise.resolve();
                    },
                },
            ],
            v2: [
                {
                    validator() {
                        return Promise.resolve();
                    },
                },
            ],
        }).validate(
            {
                v: 2,
            },
            (errors) => {
                assert.equal(errors, null);
                done();
            }
        );
    });

    it('first works', (done) => {
        new Schema(
            {
                v: [
                    {
                        validator() {
                            return Promise.reject(new Error('e1'));
                        },
                    },
                    {
                        validator() {
                            return Promise.reject(new Error('e2'));
                        },
                    },
                ],
                v2: [
                    {
                        validator() {
                            return Promise.reject(new Error('e3'));
                        },
                    },
                ],
            },
            { first: true }
        ).validate(
            {
                v: 2,
                v2: 1,
            },
            (errors) => {
                assert(errors);
                assert(errors.length === 1);
                assert(errors[0].message === 'e1');
                done();
            }
        );
    });
});

describe('promise validator with promise callback', () => {
    it('should resolve promise with null when no rules', async () => {
        const validator = new Schema({});
        const { errors } = await validator.validate({
            v: 2,
        });

        assert.equal(errors, null);
    });

    it('should resolve promise with null when no rules and no callback', async () => {
        const validator = new Schema({});
        const { errors } = await validator.validate({
            v: 2,
        });

        assert.equal(errors, null);
    });

    it('should resolve promise with null when rules with validators', async () => {
        const validator = new Schema({
            v: [{}],
        });
        const { errors } = await validator.validate({
            v: 2,
        });

        assert.equal(errors, null);
    });

    it('should resolve with null when no rules fail', async () => {
        const validator = new Schema({
            v: [
                {
                    validator() {
                        return Promise.resolve();
                    },
                },
            ],
            v2: [
                {
                    validator() {
                        return Promise.resolve();
                    },
                },
            ],
            v3: [
                {
                    validator() {
                        return Promise.resolve();
                    },
                },
            ],
        });
        const { errors } = await validator.validate({
            v: 2,
        });

        assert.deepEqual(errors, null);
    });

    it('should resolve with errors and fields when rules fail with reject', async () => {
        const validator = new Schema({
            v: [
                {
                    validator() {
                        return Promise.reject(new Error('e1'));
                    },
                },
                {
                    validator() {
                        return Promise.reject(new Error('e2'));
                    },
                },
            ],
            v2: [
                {
                    validator() {
                        return Promise.reject(new Error('e3'));
                    },
                },
            ],
        });

        const { errors, fields } = await validator.validate({
            v: 2,
        });

        assert(errors);
        assert(errors.length === 2);
        assert(Object.keys(fields).length === 2);
        assert.equal(errors[0].message, 'e1');
        assert.equal(errors[1].message, 'e3');
    });

    it('should resolve with errors and fields when rules throw error', async () => {
        const schema = new Schema({
            name: [
                {
                    aliasName: '用户名',
                    validator: () => {
                        throw new Error('haha');
                    },
                },
            ],
        });
        const { errors, fields } = await schema.validate({ name: '' });
        assert(errors);
        assert(errors.length === 1);
        assert(errors[0].message === 'haha');
        assert(Object.keys(fields).length === 1);
    });

    it('should resolve with errors and fields when rules reject with value', async () => {
        const validator = new Schema({
            v: [
                {
                    validator() {
                        return Promise.reject('e1');
                    },
                },
                {
                    validator() {
                        return Promise.reject('e2');
                    },
                },
            ],
            v2: [
                {
                    validator() {
                        return Promise.reject('e3');
                    },
                },
            ],
        });

        const { errors, fields } = await validator.validate({
            v: 2,
        });

        assert(errors);
        assert(errors.length === 2);
        assert(Object.keys(fields).length === 2);
        assert.equal(errors[0].message, 'e1');
        assert.equal(errors[1].message, 'e3');
    });

    it('should resolve with one error and field when rules fail `options.first`', async () => {
        const validator = new Schema(
            {
                v: [
                    {
                        validator() {
                            return Promise.reject(new Error('e1'));
                        },
                    },
                    {
                        validator() {
                            return Promise.reject(new Error('e2'));
                        },
                    },
                ],
                v2: [
                    {
                        validator() {
                            return Promise.reject(new Error('e3'));
                        },
                    },
                ],
            },
            { first: true }
        );

        const { errors, fields } = await validator.validate({
            v: 2,
            v2: 1,
        });

        assert(errors);
        assert(errors.length === 1);
        assert(Object.keys(fields).length === 1);
        assert.equal(errors[0].message, 'e1');
    });

    it('should support validatePromise when validator use callback', async () => {
        const validator = new Schema({
            v: [
                {
                    validator(_, value, callback) {
                        assert(typeof callback === 'function');
                        return Promise.reject('e1');
                    },
                },
                {
                    validator(_, value, callback) {
                        assert(typeof callback === 'function');
                        return Promise.reject('e1-1');
                    },
                },
            ],
            v2: [
                {
                    validator(_, value, callback) {
                        callback('e2');
                    },
                },
            ],
            v3: [
                {
                    validator(_, value, callback) {
                        callback('e3');
                        return Promise.reject('e3');
                    },
                },
            ],
        });
        const { errors, fields } = await validator.validatePromise({
            v: 's',
            v2: '',
        });
        assert(errors);
        assert(errors.length === 3);
        assert(Object.keys(fields).length === 3);
        assert.equal(errors[0].message, 'e1');
        assert.equal(errors[1].message, 'e2');
        assert.equal(errors[2].message, 'e3');
    });
});
