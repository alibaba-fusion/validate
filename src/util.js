const formatRegExp = /%[sdj%]/g;

export function format(...args) {
    let i = 1;
    const f = args[0];
    const len = args.length;
    if (typeof f === 'function') {
        return f(args.slice(1));
    }
    if (typeof f === 'string') {
        const str = String(f).replace(formatRegExp, x => {
            if (x === '%%') {
                return '%';
            }
            if (i >= len) {
                return x;
            }
            switch (x) {
                case '%s':
                    return String(args[i++]);
                case '%d':
                    return Number(args[i++]);
                case '%j':
                    try {
                        return JSON.stringify(args[i++]);
                    } catch (_) {
                        return '[Circular]';
                    }
                default:
                    return x;
            }
        });

        return str;
    }
    return f;
}

function asyncSerialArray(arr, func, callback) {
    let index = 0;
    const arrLength = arr.length;

    function next(errors) {
        if (errors && errors.length) {
            callback(errors);
            return;
        }
        const original = index;
        index = index + 1;
        if (original < arrLength) {
            func(arr[original], next);
        } else {
            return callback([]);
        }
    }

    next([]);
}

/**
 * 平铺规则
 * @param  {object} objArr [description]
 * @return {Array}        [description]
 */
function flattenObjArr(objArr) {
    const ret = [];
    Object.keys(objArr).forEach(k => {
        Object.keys(objArr[k]).forEach(r => {
            ret.push(objArr[k][r]);
        });
    });
    return ret;
}

/**
 * 异步调用
 * @param  {map}   objArr   校验规则对象列表
 * @param  {object}   option   配置项
 * @param  {Function} func     每个校验规则
 * @param  {Function} callback 全部完成后的执行
 */
export function asyncMap(objArr, option, func, callback) {
    // 发现第一个错误即返回
    if (option.first) {
        const flattenArr = flattenObjArr(objArr);
        return asyncSerialArray(flattenArr, func, callback);
    }

    const objArrKeys = Object.keys(objArr);
    const objArrLength = objArrKeys.length;
    let total = 0;
    const results = [];
    const next = errors => {
        results.push(errors);
        total++;
        if (total === objArrLength) {
            return callback(results);
        }
    };
    objArrKeys.forEach(key => {
        const arr = objArr[key];
        asyncSerialArray(arr, func, next);
    });
}

async function resolveErrorPromiseInSeries(arr, func) {
    return arr.reduce(async (prevPromise, next) => {
        let errors;
        try {
            errors = await prevPromise;
        } catch (e) {
            errors = e;
        }

        if (errors && errors.length) {
            return errors;
        }

        return func(next);
    }, Promise.resolve());
}

export async function asyncMapPromise(objArr, option, func) {
    if (option.first) {
        const flatObjArr = flattenObjArr(objArr);

        return resolveErrorPromiseInSeries(flatObjArr, func);
    }

    const objArrValues = Object.values(objArr);

    return Promise.all(
        objArrValues.map(val => resolveErrorPromiseInSeries(val, func))
    );
}

export function complementError(rule) {
    return oe => {
        if (oe && oe.message) {
            oe.field = rule.field;
            return oe;
        }
        return {
            message: oe,
            field: rule.field,
        };
    };
}

/**
 *
 * @param {Array} results errors from running validation
 * @returns {Object} { errors: Array, fields: Object }
 */
export function processErrorResults(results = []) {
    let errors = [];
    let fields = {};

    function add(e) {
        if (Array.isArray(e)) {
            errors = errors.concat(e);
        } else {
            errors.push(e);
        }
    }

    for (let i = 0; i < results.length; i++) {
        add(results[i]);
    }

    if (!errors.length) {
        errors = null;
        fields = null;
    } else {
        for (let i = 0; i < errors.length; i++) {
            const field = errors[i].field;
            if (field) {
                fields[field] = fields[field] || [];
                fields[field].push(errors[i]);
            }
        }
    }

    return {
        errors,
        fields,
    };
}
