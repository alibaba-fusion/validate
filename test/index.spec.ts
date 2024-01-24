import { assert } from 'chai';
import Schema from '../src';

describe('config', () => {
    it('works with aliasName', (done) => {
        const schema = new Schema({
            name: [
                {
                    required: true,
                    aliasName: '用户名',
                },
            ],
        });

        schema.validate(
            {
                name: '',
            },
            (errors) => {
                assert(errors);
                assert(errors.length === 1);
                assert(errors[0].message === '用户名 是必填字段');
                done();
            }
        );
    });
});
