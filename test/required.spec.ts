import assert from 'power-assert';
import Schema from '../src';

const required = true;

/* global describe, it */
describe('required', () => {
    describe('validate', () => {
        it('error with null or undefined', done => {
            new Schema({
                v1: { required },
                v2: { required },
                v3: { required: false },
            }).validate(
                {
                    v1: null,
                    v2: undefined,
                    v3: ''
                },
                errors => {
                    assert(errors.length === 2);
                    assert(errors[0].message === 'v1 是必填字段');
                    assert(errors[1].message === 'v2 是必填字段');
                    done();
                }
            );
        });
    
        it('error with array=[]', done => {
            new Schema({
                v: { required, message: 'no' },
            }).validate(
                {
                    v: [],
                },
                errors => {
                    assert(errors.length === 1);
                    assert(errors[0].message === 'no');
                    done();
                }
            );
        });
    
        it('error with string=""', done => {
            new Schema({
                v: { required, message: 'no' },
            }).validate(
                {
                    v: '',
                },
                errors => {
                    assert(errors.length === 1);
                    assert(errors[0].message === 'no');
                    done();
                }
            );
        });
    
        it('no error with boolean=false', done => {
            new Schema({
                v: { required, message: 'no' },
            }).validate(
                {
                    v: false,
                },
                errors => {
                    assert(errors === null);
                    done();
                }
            );
        });
    
        it('noerror with array/number/string/object', done => {
            new Schema({
                v: { required },
                v1: { required },
                v2: { required },
                v3: { required },
            }).validate(
                {
                    v: [1],
                    v1: 0,
                    v2: '0',
                    v3: {},
                },
                errors => {
                    assert(errors === null);
                    done();
                }
            );
        });
    })
    
    describe('validatePromise', () => {
   
        it('error with null or undefined', done => {
            new Schema({
                v1: { required },
                v2: { required },
            }).validatePromise(
                {
                    v1: null,
                    v2: undefined,
                }).then(
                ({errors}) => {
                    assert.equal(errors.length, 2);
                    assert(errors[0].message === 'v1 是必填字段');
                    assert(errors[1].message === 'v2 是必填字段');
                    done();
                });
        });
    
        it('error with array=[]', done => {
            new Schema({
                v: { required, message: 'no' },
            }).validatePromise(
                {
                    v: [],
                }).then(
                ({errors}) => {
                    assert(errors.length === 1);
                    assert(errors[0].message === 'no');
                    done();
                }
            );
        });
    
        it('error with string=""', done => {
            new Schema({
                v: { required, message: 'no' },
            }).validatePromise(
                {
                    v: '',
                }).then(
                ({errors}) => {
                    assert(errors.length === 1);
                    assert(errors[0].message === 'no');
                    done();
                }
            );
        });
    
        it('no error with boolean=false', done => {
            new Schema({
                v: { required, message: 'no' },
            }).validate(
                {
                    v: false,
                }).then(
                ({errors}) => {
                    assert(errors === null);
                    done();
                }
            );
        });
    
        it('noerror with array/number/string/object', done => {
            new Schema({
                v: { required },
                v1: { required },
                v2: { required },
                v3: { required },
            }).validate(
                {
                    v: [1],
                    v1: 0,
                    v2: '0',
                    v3: {},
                }).then(
                ({errors}) => {
                    assert(errors === null);
                    done();
                }
            );
        });
    })
});
