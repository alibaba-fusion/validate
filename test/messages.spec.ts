import { assert } from 'chai';
import Schema from '../src';
import { MessagesConfig } from '../src/types';

describe('messages', () => {
    describe('validate', () => {
        it('can call messages', (done) => {
            const messages: MessagesConfig = {
                required(f) {
                    return `${f} required!`;
                },
            };
            const schema = new Schema({
                v: {
                    required: true,
                },
                v2: {
                    minLength: 2,
                },
            });
            schema.messages(messages);
            schema.validate(
                {
                    v: '',
                    v2: '1',
                },
                (errors) => {
                    assert(errors);
                    assert(errors.length === 2);
                    assert(errors[0].message === 'v required!');
                    assert(errors[1].message === 'v2 字段字符长度不得少于 2');
                    assert(Object.keys(messages).length === 1);
                    done();
                }
            );
        });

        it('can use options.messages', (done) => {
            const messages: MessagesConfig = {
                required(f) {
                    return `${f} required!`;
                },
            };
            const schema = new Schema(
                {
                    v: {
                        required: true,
                    },
                    v2: {
                        min: 2,
                    },
                },
                {
                    messages,
                }
            );
            schema.validate(
                {
                    v: '',
                    v2: '1',
                },
                (errors) => {
                    assert(errors);
                    assert(errors.length === 2);
                    assert(errors[0].message === 'v required!');
                    assert(errors[1].message === 'v2 字段数值不得小于 2');
                    assert(Object.keys(messages).length === 1);
                    done();
                }
            );
        });

        it('message can be object', (done) => {
            const atom = {};
            const messages = {
                required: atom,
            };
            const schema = new Schema(
                {
                    v: {
                        required: true,
                    },
                },
                {
                    messages,
                }
            );
            schema.validate(
                {
                    v: '',
                },
                (errors) => {
                    assert(errors);
                    assert(errors.length === 1);
                    assert(errors[0].message === atom);
                    assert(Object.keys(messages).length === 1);
                    assert(messages.required === atom);
                    done();
                }
            );
        });
    });

    describe('validatePromise', () => {
        it('can call messages', (done) => {
            const messages: MessagesConfig = {
                required(f) {
                    return `${f} required!`;
                },
            };
            const schema = new Schema({
                v: {
                    required: true,
                },
                v2: {
                    minLength: 2,
                },
            });
            schema.messages(messages);
            schema
                .validatePromise({
                    v: '',
                    v2: '1',
                })
                .then(({ errors }) => {
                    assert(errors);
                    assert(errors.length === 2);
                    assert(errors[0].message === 'v required!');
                    assert(errors[1].message === 'v2 字段字符长度不得少于 2');
                    assert(Object.keys(messages).length === 1);
                    done();
                });
        });

        it('can use options.messages', (done) => {
            const messages: MessagesConfig = {
                required(f) {
                    return `${f} required!`;
                },
            };
            const schema = new Schema(
                {
                    v: {
                        required: true,
                    },
                    v2: {
                        min: 2,
                    },
                },
                {
                    messages,
                }
            );
            schema
                .validatePromise({
                    v: '',
                    v2: '1',
                })
                .then(({ errors }) => {
                    assert(errors);
                    assert(errors.length === 2);
                    assert(errors[0].message === 'v required!');
                    assert(errors[1].message === 'v2 字段数值不得小于 2');
                    assert(Object.keys(messages).length === 1);
                    done();
                });
        });

        it('message can be object', (done) => {
            const atom = {};
            const messages = {
                required: atom,
            };
            const schema = new Schema(
                {
                    v: {
                        required: true,
                    },
                },
                {
                    messages,
                }
            );
            schema
                .validatePromise({
                    v: '',
                })
                .then(({ errors }) => {
                    assert(errors);
                    assert(errors.length === 1);
                    assert(errors[0].message === atom);
                    assert(Object.keys(messages).length === 1);
                    assert(messages.required === atom);
                    done();
                });
        });
    });
});
