import assert from 'power-assert';
import Schema from '../src';

const urlRules = (keys = [], format = 'url') => {
    const obj = {};
    keys.forEach(key => {
        obj[key] = {format};
    });
    return obj;
};

/* global describe, it */
describe('format', () => {

    describe('validate', () => {
        describe('url', () => {
            it('works for empty string', done => {
                new Schema({
                    v: {
                        format: 'url',
                    }
                }).validate(
                    {
                        v: '',
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });

            it('works for type not a valid url', done => {
                new Schema(urlRules(['v', 'v1', 'v2', 'v3', 'v4']))
                .validate(
                    {
                        v: ' ',
                        v1: 'abcd',
                        v2: 'http:/fusion.design',
                        v3: 'http:fusion.design/',
                        v4: 'http://www.taobao.com/abc?abc=%23&b=  a~c#abc    ',
                    },
                    errors => {
                        assert(errors.length === 5);
                        assert(errors[0].message === 'v 不是合法的 URL 地址');
                        done();
                    }
                );
            });

            it('support http/https/ftp and no schema', done => {
                new Schema(urlRules(['v1', 'v2', 'v3']))
                .validate(
                    {
                        v1: 'http://www.taobao.com',
                        v2: 'https://www.taobao.com',
                        v3: 'ftp://www.taobao.com',
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });

            it('should support no schema', done => {
                new Schema(urlRules(['v']))
                .validate(
                    {
                        v: '//www.taobao.com',
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('works for ip url', done => {
                new Schema(urlRules(['v', 'v1', 'v2']))
                .validate(
                    {
                        v: 'http://10.218.136.29/talent-tree/src/index.html',
                        v1: 'https://10.218.136.29/talent-tree/src/index.html',
                        v2: 'https://10.218.136.29:8000/talent-tree/src/index.html',
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });

            it('works for chinese url', done => {
                new Schema(urlRules(['v', 'v1']))
                .validate(
                    {
                        v: 'http://中文.com',
                        v1: 'http://中文.后缀',
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });
            it('works for url with `-` ', done => {
                new Schema(urlRules(['v', 'v1']))
                .validate(
                    {
                        v: '//fusion-design.com',
                        v1: '//fusion-design.ali-inc.com',
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });
            it('works for type url has query', done => {
                new Schema({
                    v: {
                        format: 'url',
                    },
                }).validate(
                    {
                        v: 'http://www.taobao.com/abc?a=a',
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('works for type url has hash', done => {
                new Schema({
                    v: {
                        format: 'url',
                    },
                }).validate(
                    {
                        v: 'http://www.taobao.com/abc#!abc',
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('works for type url has query and has', done => {
                new Schema({
                    v: {
                        format: 'url',
                    },
                }).validate(
                    {
                        v: 'http://www.taobao.com/abc?abc=%23&b=a~c#abc',
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });

            it('should not timeout with complicated url', done => {
                const url = 'https://item.taobao.com/item.htm?id=606535109270&ali_trackid=2:mm_12238993_19794510_110896800135:1637753061_136_624411470&union_lens=lensId:OPT@1637753056@6dcd3e84-67cc-4ee1-9dbc-00639596ecfa_606535109270@1;recoveryid:201_11.27.64.247_12983227_1637753058662;prepvid:201_11.27.64.247_12983227_1637753058662&spm=a231o.13503973.20618785.2&pvid=6dcd3e84-67cc-4ee1-9dbc-00639596ecfa&scm=1007.16016.217477.0&bxsign=tbkviNxf5b2kLFy42lYxfcooSjl4jfCk7bU52g4aDLoMBvTtXRlJVFhYZdJHDKQOOAlwjNBk91TjipSBf2/R6Y5B8O8qd/Hqs8CwaNRKD5abzg=';

                new Schema({
                    v: {
                        format: 'url',
                    },
                }).validate(
                    {
                        v: url,
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });
            it('should support localhost', done => {
                new Schema({
                    v: {
                        format: 'url',
                    },
                }).validate(
                    {
                        v: '//localhost',
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });
        });
    
        describe('email', () => {
            it('works for empty string', done => {
                new Schema({
                    v: {
                        format: 'email',
                    },
                }).validate(
                    {
                        v: '',
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('works for normal email', done => {
                new Schema(urlRules(['v', 'v1', 'v2'], 'email'))
                .validate(
                    {
                        v: 'bindoon@sina.com',
                        v1: 'qc.qc@alibaba-inc.com',
                        v2: 'fusion-design@list.alibaba-inc.com'
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });

            it('works for chinese email', done => {
                new Schema(urlRules(['v', 'v1'], 'email'))
                .validate(
                    {
                        v: 'bindoon@sina.中国',
                        v1: '姓名@公司.中国'
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('not valid email', done => {
                new Schema(urlRules(['v', 'v1', 'v2'], 'email'))
                .validate(
                    {
                        v: 'bindoon@sina .com',
                        v1: 'bindoon',
                        v2: 'a@a'
                    },
                    errors => {
                        assert(errors.length === 3);
                        assert(errors[0].message === 'v 不是合法的 email 地址');
                        done();
                    }
                );
            });
        });
    
        describe('number', () => {
            it('works for empty string', done => {
                new Schema({
                    v: {
                        format: 'number',
                    },
                }).validate(
                    {
                        v: '',
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('works for string number', done => {
                new Schema({
                    v: {
                        format: 'number',
                    },
                }).validate(
                    {
                        v: '123456',
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('works for integer number', done => {
                new Schema({
                    v: {
                        format: 'number',
                    },
                }).validate(
                    {
                        v: 123456,
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('not valid number', done => {
                new Schema({
                    v: {
                        format: 'number',
                    },
                }).validate(
                    {
                        v: '1zbcd',
                    },
                    errors => {
                        assert(errors.length === 1);
                        assert(errors[0].message === 'v 不是合法的数字');
                        done();
                    }
                );
            });
        });
    
        describe('tel', () => {
            it('works for empty string', done => {
                new Schema({
                    v: {
                        format: 'tel',
                    },
                }).validate(
                    {
                        v: '',
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('works for string tel', done => {
                new Schema({
                    v: {
                        format: 'tel',
                    },
                    v2: {
                        format: 'tel',
                    },
                    v3: {
                        format: 'tel',
                    },
                }).validate(
                    {
                        v: '15688888888',
                        v2: '400-800-8888',
                        v3: '0513-8888888',
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('not valid tel', done => {
                new Schema({
                    v: {
                        format: 'tel',
                    },
                    v2: {
                        format: 'tel',
                    },
                }).validate(
                    {
                        v: '1zbcd',
                        v2: '15688888888abcd',
                    },
                    errors => {
                        assert(errors.length === 2);
                        assert(errors[0].message === 'v 不是合法的电话号码');
                        done();
                    }
                );
            });
        });

        describe('IDNumber', () => {
            it('works for empty string', done => {
                new Schema({
                    v: {
                        format: 'IDNumber',
                    },
                }).validate(
                    {
                        v: '',
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });

            it('works for normal IDNumber', done => {
                new Schema({
                    v: {
                        format: 'IDNumber',
                    },
                }).validate(
                    {
                        v: '53010219200508011X',
                    },
                    errors => {
                        assert(errors === null);
                        done();
                    }
                );
            });

            it('not valid IDNumber', done => {
                new Schema({
                    v: {
                        format: 'IDNumber',
                    },
                }).validate(
                    {
                        v: '1234566789012309872',
                    },
                    errors => {
                        assert(errors.length === 1);
                        assert(errors[0].message === 'v 不是合法的身份证号码');
                        done();
                    }
                );
            });
        });
    })

    describe('validatePromise', () => {
        describe('url', () => {
            it('works for empty string', done => {
                new Schema({
                    v: {
                        format: 'url',
                    },
                }).validate(
                    {
                        v: '',
                    }).then(
                    ({errors}) => {
                        assert.equal(errors, null);
                        done();
                    }
                );
            });
    
            it('works for ip url', done => {
                new Schema({
                    v: {
                        format: 'url',
                    },
                }).validatePromise(
                    {
                        v: 'http://10.218.136.29/talent-tree/src/index.html',
                    }).then(({errors}) => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('works for type url', done => {
                new Schema({
                    v: {
                        format: 'url',
                    },
                }).validatePromise(
                    {
                        v: 'http://www.taobao.com',
                    }).then(({errors}) => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('works for type url has query', done => {
                new Schema({
                    v: {
                        format: 'url',
                    },
                }).validatePromise(
                    {
                        v: 'http://www.taobao.com/abc?a=a',
                    }).then(({errors}) => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('works for type url has hash', done => {
                new Schema({
                    v: {
                        format: 'url',
                    },
                }).validatePromise(
                    {
                        v: 'http://www.taobao.com/abc#!abc',
                    }).then(({errors}) => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('works for type url has query and has', done => {
                new Schema({
                    v: {
                        format: 'url',
                    },
                }).validatePromise(
                    {
                        v: 'http://www.taobao.com/abc?abc=%23&b=a~c#abc',
                    }).then(({errors}) => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('support skip schema', done => {
                new Schema({
                    v: {
                        format: 'url',
                    },
                }).validatePromise(
                    {
                        v: '//g.cn',
                    }).then(({errors}) => {
                        assert(errors === null);
                        done();
                    }
                );
            });
        });
    
        describe('email', () => {
            it('works for empty string', done => {
                new Schema({
                    v: {
                        format: 'email',
                    },
                }).validatePromise(
                    {
                        v: '',
                    }).then(({errors}) => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('works for normal email', done => {
                new Schema({
                    v: {
                        format: 'email',
                    },
                }).validatePromise(
                    {
                        v: 'bindoon@sina.com',
                    }).then(({errors}) => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('not valid email', done => {
                new Schema({
                    v: {
                        format: 'email',
                    },
                }).validatePromise(
                    {
                        v: 'bindoon@sina .com',
                    }).then(({errors}) => {
                        assert(errors.length === 1);
                        assert(errors[0].message === 'v 不是合法的 email 地址');
                        done();
                    }
                );
            });
        });
    
        describe('number', () => {
            it('works for empty string', done => {
                new Schema({
                    v: {
                        format: 'number',
                    },
                }).validatePromise(
                    {
                        v: '',
                    }).then(({errors}) => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('works for string number', done => {
                new Schema({
                    v: {
                        format: 'number',
                    },
                }).validatePromise(
                    {
                        v: '123456',
                    }).then(({errors}) => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('works for integer number', done => {
                new Schema({
                    v: {
                        format: 'number',
                    },
                }).validatePromise(
                    {
                        v: 123456,
                    }).then(({errors}) => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('not valid number', done => {
                new Schema({
                    v: {
                        format: 'number',
                    },
                }).validatePromise(
                    {
                        v: '1zbcd',
                    }).then(({errors}) => {
                        assert(errors.length === 1);
                        assert(errors[0].message === 'v 不是合法的数字');
                        done();
                    }
                );
            });
        });
    
        describe('tel', () => {
            it('works for empty string', done => {
                new Schema({
                    v: {
                        format: 'tel',
                    },
                }).validatePromise(
                    {
                        v: '',
                    }).then(({errors}) => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('works for string tel', done => {
                new Schema({
                    v: {
                        format: 'tel',
                    },
                    v2: {
                        format: 'tel',
                    },
                    v3: {
                        format: 'tel',
                    },
                }).validatePromise(
                    {
                        v: '15688888888',
                        v2: '400-800-8888',
                        v3: '0513-8888888',
                    }).then(({errors}) => {
                        assert(errors === null);
                        done();
                    }
                );
            });
    
            it('not valid tel', done => {
                new Schema({
                    v: {
                        format: 'tel',
                    },
                    v2: {
                        format: 'tel',
                    },
                }).validatePromise(
                    {
                        v: '1zbcd',
                        v2: '15688888888abcd',
                    }).then(({errors}) => {
                        assert(errors.length === 2);
                        assert(errors[0].message === 'v 不是合法的电话号码');
                        done();
                    }
                );
            });
        });
    })
});
