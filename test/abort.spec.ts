import { assert } from 'chai';
import { spy } from 'sinon';
import Schema from '../src';

describe('abort', () => {
    it('works with abort', (done) => {
        const schema = new Schema({
            v: [
                {
                    validator(rule, value, callback) {
                        setTimeout(() => {
                            callback(new Error('e3'));
                        }, 300);
                    },
                },
            ],
        });
        const callback = spy();

        schema.validate(
            {
                v: 2,
            },
            () => {
                callback();
                done();
            }
        );

        schema.abort();

        schema.validate(
            {
                v: 3,
            },
            (errors) => {
                assert(!callback.called);
                assert(errors);
                assert(errors.length === 1);
                done();
            }
        );
    });
});
