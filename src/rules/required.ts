import * as util from '../util';
import type { PresetValidator } from '../types';

/**
 *  Rule for validating required fields.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param errors An array of errors that this rule may add
 *  validation errors to.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */
const required: PresetValidator = function required(
    rule,
    value,
    errors,
    options
) {
    if (
        value === undefined ||
        value === null ||
        value === '' ||
        (value as { length: number }).length === 0
    ) {
        errors.push(
            util.format(options.messages.required, rule.aliasName || rule.field)
        );
    }
};

export default required;
