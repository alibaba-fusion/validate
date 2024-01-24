import {
    NormalizedValidateError,
    SerializedRule,
    ValidateError,
} from './types';

const formatRegExp = /%[sdj%]/g;

export function format<R>(f: () => R, ...args: unknown[]): R;
export function format(f: string, ...args: unknown[]): string;
export function format<V>(f: V, ...args: unknown[]): V;
export function format(...args: [unknown, ...others: unknown[]]): unknown {
    let i = 1;
    const f = args[0];
    const len = args.length;
    if (typeof f === 'function') {
        return f(args.slice(1));
    }
    if (typeof f === 'string') {
        const str = String(f).replace(formatRegExp, (x) => {
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
                    return Number(args[i++]) as unknown as string;
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

/**
 * 串联校验一组数据，只返回第一个出错结果
 * @param arr
 * @param validator
 * @param callback 出递归，告诉错误校验完成
 */
function _asyncValidateSerials<Item, ErrorItem>(
    arr: Item[],
    validator: (
        item: Item,
        next: (errors?: ErrorItem[] | null) => unknown
    ) => unknown,
    callback: (errors: ErrorItem[]) => unknown
) {
    let index = 0;
    const arrLength = arr.length;

    function next(errors?: ErrorItem[] | null) {
        if (errors && errors.length) {
            return callback(errors);
        }
        const original = index;
        index = index + 1;
        if (original < arrLength) {
            validator(arr[original], next);
        } else {
            return callback([]);
        }
    }

    next([]);
}

/**
 * 串联校验一组数据，只返回第一个出错结果
 */
async function _promiseValidateSeries<Item, ErrorItem>(
    arr: Item[],
    validator: (item: Item) => ErrorItem[] | Promise<ErrorItem[]>
) {
    return arr.reduce(
        async (prevPromise, next) => {
            let errors: ErrorItem[];
            try {
                errors = await prevPromise;
            } catch (e) {
                errors = e;
            }

            if (errors && errors.length) {
                return errors;
            }

            return validator(next);
        },
        [] as ErrorItem[] | Promise<ErrorItem[]>
    );
}

/**
 * 平铺规则
 * @param objArr {name: [{value, rule}, {value, rule2}], name2: [{value2, rule3}]}
 * @return [{value, rule}, {value, rule2}, {value2, rule3}]
 */
function flattenObjArr<Item>(objArr: { [key: string | number]: Item[] }) {
    const ret: Item[] = [];
    Object.keys(objArr).forEach((k) => {
        Object.keys(objArr[k]).forEach((r) => {
            ret.push(objArr[k][r as unknown as number]);
        });
    });
    return ret;
}

/**
 * 异步调用
 * @param objArr   校验规则对象列表
 * @param option   配置项
 * @param validator     每个校验规则
 * @param callback 全部完成后的执行
 */
export function asyncMap<Item, ResultItem>(
    objArr: Record<string, Item[]>,
    option: { first?: boolean },
    validator: (item: Item, next: (errors?: ResultItem[]) => void) => void,
    callback: (results: Array<ResultItem | ResultItem[]>) => void
) {
    // 发现第一个错误即返回
    if (option.first) {
        const flattenArr = flattenObjArr(objArr);
        return _asyncValidateSerials(flattenArr, validator, callback);
    }

    const objArrKeys = Object.keys(objArr);
    const objArrLength = objArrKeys.length;
    let total = 0;
    const results: Array<ResultItem | ResultItem[]> = [];
    const next = (errors: ResultItem[]) => {
        results.push(errors);
        total++;
        if (total === objArrLength) {
            return callback(results);
        }
    };
    objArrKeys.forEach((key) => {
        const arr = objArr[key];
        _asyncValidateSerials(arr, validator, next);
    });
}

export async function asyncMapPromise<Item, ErrorItem>(
    objArr: Record<string, Item[]>,
    option: { first?: boolean },
    validator: (rule: Item) => ErrorItem[] | Promise<ErrorItem[]>
) {
    if (option.first) {
        const flatObjArr = flattenObjArr(objArr);

        return await _promiseValidateSeries(flatObjArr, validator);
    }

    const objArrValues = Object.values(objArr);

    return await Promise.all(
        objArrValues.map((val) => _promiseValidateSeries(val, validator))
    );
}

export function complementError(rule: SerializedRule) {
    return (oe: ValidateError | string): NormalizedValidateError => {
        if (oe && typeof oe === 'object' && oe.message) {
            (oe as NormalizedValidateError).field = rule.field;
            return oe as NormalizedValidateError;
        }
        return {
            message: oe as string,
            field: rule.field,
        };
    };
}

/**
 *
 * @param results errors from running validation
 * @returns \{ errors: Array, fields: Object }
 */
export function processErrorResults(
    results:
        | Array<NormalizedValidateError | NormalizedValidateError[]>
        | undefined = []
) {
    let errors: NormalizedValidateError[] = [];
    const fields: Record<string, NormalizedValidateError[]> = {};

    function add(e: NormalizedValidateError | NormalizedValidateError[]) {
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
        return {
            errors: null,
            fields: null,
        };
    } else {
        for (let i = 0; i < errors.length; i++) {
            const field = errors[i].field;
            if (field) {
                fields[field] = fields[field] || [];
                fields[field].push(errors[i]);
            }
        }
        return {
            errors,
            fields,
        };
    }
}
