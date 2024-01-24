import * as util from '../util';
import { PresetValidator } from '../types';

/**
 *  Rule for validating minimum and maximum allowed values.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param errors An array of errors that this rule may add
 *  validation errors to.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */
const length: PresetValidator = function length(
    rule,
    value: string | number | unknown[],
    errors,
    options
) {
    let key: 'number' | 'string' | 'array' | null = null;
    const isNum = typeof value === 'number';
    const isStr = typeof value === 'string';
    const isArr = Array.isArray(value);

    if (isNum) {
        key = 'number';
    } else if (isStr) {
        key = 'string';
    } else if (isArr) {
        key = 'array';
    }

    if (!key) {
        return false;
    }

    const val = isNum ? `${value}` : value;
    const length = Number(rule.length);
    const maxLength = Number(rule.maxLength);
    const minLength = Number(rule.minLength);

    if (minLength || maxLength || length) {
        const len = val.length;
        if (length && len !== rule.length) {
            errors.push(
                util.format(
                    options.messages[key].length,
                    rule.aliasName || rule.field,
                    rule.length
                )
            );
        } else if (len < minLength) {
            errors.push(
                util.format(
                    options.messages[key].minLength,
                    rule.aliasName || rule.field,
                    rule.minLength
                )
            );
        } else if (len > maxLength) {
            errors.push(
                util.format(
                    options.messages[key].maxLength,
                    rule.aliasName || rule.field,
                    rule.maxLength
                )
            );
        }
    }
};

export default length;
