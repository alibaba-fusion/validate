import * as util from '../util';
import type { PresetValidator } from '../types';

/**
 *  Rule for validating a regular expression pattern.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param errors An array of errors that this rule may add
 *  validation errors to.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */
const pattern: PresetValidator = function pattern(
    rule,
    value: string,
    errors,
    options
) {
    if (rule.pattern) {
        if (rule.pattern instanceof RegExp) {
            if (!rule.pattern.test(value)) {
                errors.push(
                    util.format(
                        options.messages.pattern,
                        rule.aliasName || rule.field,
                        value,
                        rule.pattern
                    )
                );
            }
        } else if (typeof rule.pattern === 'string') {
            const _pattern = new RegExp(rule.pattern);
            if (!_pattern.test(value)) {
                errors.push(
                    util.format(
                        options.messages.pattern,
                        rule.aliasName || rule.field,
                        value,
                        rule.pattern
                    )
                );
            }
        }
    }
};

export default pattern;
