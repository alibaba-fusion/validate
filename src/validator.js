/* eslint-disable callback-return */
import rules from './rules/';

/**
 * {required, format} => format; {required} => required
 * If a promise is wanted from the validator, either return a promise from the callback,
 *      or do not pass a callback
 *
 * @param  {function} validator [description]
 * @param  {string} ruleType  [description]
 * @return {function}           [description]
 */
export function validateFunc(validator, ruleType) {
    return (rule, value, cb, options) => {
        const errors = [];

        // 如果是非required校验
        if (ruleType !== 'required') {
            const errors = [];
            rules.required(rule, value, errors, options);
            // 空数据
            if (errors.length > 0) {
                if ('required' in rule && rule.required) {
                    if (cb) {
                        return cb(errors);
                    } else {
                        return Promise.reject(errors);
                    }
                } else if (cb) {
                    return cb([]); //空数据，并且没有require要求，则忽略
                } else {
                    return Promise.resolve(null);
                }
            }
        }

        validator(rule, value, errors, options);
        if (cb) {
            return cb(errors);
        }
        if (Promise) {
            return Promise.resolve(errors);
        }
    };
}

/**
 * {required, format} => format; {required} => required
 * @param  {object} rule [description]
 * @return {function}      [description]
 */
export function getValidationMethod(rule) {
    if (typeof rule.validator === 'function') {
        return rule.validator;
    }

    const keys = Object.keys(rule);

    //required和其他校验规则共存
    //{required, format} {required, unknown}
    for (let i = 0; i < keys.length; i++) {
        const ruleType = keys[i];

        if (ruleType === 'required') {
            continue;
        }
        if (ruleType in rules) {
            return validateFunc(rules[ruleType], ruleType);
        }
    }

    // 有其他位置参数
    if ('required' in rule && rule.required) {
        return validateFunc(rules.required, 'required');
    }

    return null;
}
