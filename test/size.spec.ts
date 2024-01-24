import { assert } from 'chai';
import Schema from '../src';

describe('size', () => {
    describe('validate', () => {
        it('error with min', (done) => {
            new Schema({
                v: {
                    min: 3,
                },
                v1: {
                    min: 3,
                },
            }).validate(
                {
                    v: '1',
                    v1: 1,
                },
                (errors) => {
                    assert(errors);
                    assert(errors.length === 2);
                    assert(errors[0].message === 'v 字段数值不得小于 3');
                    done();
                }
            );
        });

        it('noerror with min', (done) => {
            new Schema({
                v: {
                    min: 3,
                },
                v1: {
                    min: 3,
                },
                v2: {
                    min: 3,
                },
            }).validate(
                {
                    v: '4',
                    v1: 4,
                    v2: {},
                },
                (errors) => {
                    assert(errors === null);
                    done();
                }
            );
        });

        it('error with max', (done) => {
            new Schema({
                v: {
                    max: 3,
                },
                v1: {
                    max: 3,
                },
            }).validate(
                {
                    v: '5',
                    v1: 5,
                },
                (errors) => {
                    assert(errors);
                    assert(errors.length === 2);
                    assert(errors[0].message === 'v 字段数值不得大于 3');
                    done();
                }
            );
        });

        it('noerror with max', (done) => {
            new Schema({
                v: {
                    max: 3,
                },
                v1: {
                    max: 3,
                },
            }).validate(
                {
                    v: '1',
                    v1: 1,
                },
                (errors) => {
                    assert(errors === null);
                    done();
                }
            );
        });

        it('error with min & max', (done) => {
            new Schema({
                v: {
                    min: 3,
                    max: 30,
                    message: 'must between 3 and 30',
                },
                v1: {
                    min: 3,
                    max: 30,
                },
            }).validate(
                {
                    v: '1',
                    v1: 31,
                },
                (errors) => {
                    assert(errors);
                    assert(errors.length === 2);
                    assert(errors[0].message === 'must between 3 and 30');
                    done();
                }
            );
        });

        it('noerror with min & max', (done) => {
            new Schema({
                v: {
                    min: 3,
                    max: 30,
                    message: 'must between 3 and 30',
                },
                v1: {
                    min: 3,
                    max: 30,
                },
            }).validate(
                {
                    v: 10,
                    v1: 19,
                },
                (errors) => {
                    assert(errors === null);
                    done();
                }
            );
        });

        it('error with min=0 or max=0', (done) => {
            new Schema({
                v: {
                    min: 0,
                },
                v1: {
                    max: 0,
                },
            }).validate(
                {
                    v: -1,
                    v1: 1,
                },
                (errors) => {
                    assert(errors);
                    assert(errors.length === 2);
                    done();
                }
            );
        });
    });

    describe('validatePromise', () => {
        it('error with min', (done) => {
            new Schema({
                v: {
                    min: 3,
                },
                v1: {
                    min: 3,
                },
            })
                .validatePromise({
                    v: '1',
                    v1: 1,
                })
                .then(({ errors }) => {
                    assert(errors);
                    assert(errors.length === 2);
                    assert(errors[0].message === 'v 字段数值不得小于 3');
                    done();
                });
        });

        it('noerror with min', (done) => {
            new Schema({
                v: {
                    min: 3,
                },
                v1: {
                    min: 3,
                },
                v2: {
                    min: 3,
                },
            })
                .validatePromise({
                    v: '4',
                    v1: 4,
                    v2: {},
                })
                .then(({ errors }) => {
                    assert(errors === null);
                    done();
                });
        });

        it('error with max', (done) => {
            new Schema({
                v: {
                    max: 3,
                },
                v1: {
                    max: 3,
                },
            })
                .validatePromise({
                    v: '5',
                    v1: 5,
                })
                .then(({ errors }) => {
                    assert(errors);
                    assert(errors.length === 2);
                    assert(errors[0].message === 'v 字段数值不得大于 3');
                    done();
                });
        });

        it('noerror with max', (done) => {
            new Schema({
                v: {
                    max: 3,
                },
                v1: {
                    max: 3,
                },
            })
                .validatePromise({
                    v: '1',
                    v1: 1,
                })
                .then(({ errors }) => {
                    assert(errors === null);
                    done();
                });
        });

        it('error with min & max', (done) => {
            new Schema({
                v: {
                    min: 3,
                    max: 30,
                    message: 'must between 3 and 30',
                },
                v1: {
                    min: 3,
                    max: 30,
                },
            })
                .validatePromise({
                    v: '1',
                    v1: 31,
                })
                .then(({ errors }) => {
                    assert(errors);
                    assert(errors.length === 2);
                    assert(errors[0].message === 'must between 3 and 30');
                    done();
                });
        });

        it('noerror with min & max', (done) => {
            new Schema({
                v: {
                    min: 3,
                    max: 30,
                    message: 'must between 3 and 30',
                },
                v1: {
                    min: 3,
                    max: 30,
                },
            })
                .validatePromise({
                    v: 10,
                    v1: 19,
                })
                .then(({ errors }) => {
                    assert(errors === null);
                    done();
                });
        });
    });
});
