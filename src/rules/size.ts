import * as util from '../util';
import type { PresetValidator } from '../types';

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
const size: PresetValidator = function size(rule, value, errors, options) {
    let key: 'number' | 'string' | null = null;
    const isNum = typeof value === 'number';
    const isStr = typeof value === 'string';

    if (isNum) {
        key = 'number';
    } else if (isStr) {
        key = 'string';
    }

    if (!key) {
        return false;
    }

    // TODO: 2.x change to typeof rule.min === 'number' || typeof rule.max === 'number'
    if (typeof rule.min !== 'undefined' || typeof rule.max !== 'undefined') {
        let val = value as number;
        const max = Number(rule.max);
        const min = Number(rule.min);

        if (isStr) {
            val = Number(val);
        }

        if (val < min) {
            errors.push(
                util.format(
                    options.messages[key].min,
                    rule.aliasName || rule.field,
                    rule.min
                )
            );
        } else if (val > max) {
            errors.push(
                util.format(
                    options.messages[key].max,
                    rule.aliasName || rule.field,
                    rule.max
                )
            );
        }
    }
};

export default size;
