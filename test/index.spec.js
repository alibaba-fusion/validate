import assert from 'power-assert';
import Schema from '../src';

/* global describe, it */
describe('config', () => {
    it.only('works with aliasName', done => {
        const schema = new Schema({
            name: [
                {
                    required: true,
                    aliasName: '用户名'
                },
            ],
        });

        schema.validate(
            {
                name: '',
            },
            errors => {
                assert(errors.length === 1);
                assert(errors[0].message === '用户名 是必填字段');
                done();
            }
        );
    });
});
