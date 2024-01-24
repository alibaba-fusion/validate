import {
    complementError,
    asyncMap,
    asyncMapPromise,
    processErrorResults,
} from './util';
import defaultMessages from './messages';
import { getValidationMethod } from './validator';
import {
    Rule,
    RuleMap,
    SerializedRule,
    Option,
    NormalizedOption,
    ValidationItem,
    ValidateSource,
    MessagesConfig,
    ValidateCallback,
    ValidatorCallback,
    ValidatorCallbackErrors,
    NormalizedValidateError,
} from './types';

function noop() {}
/**
 * @param source - {name: value, name2: value2}
 * @param rules - {name: [rule1, rule2]}
 * @returns - {name:[{value,rule1},{value, rule2}]}
 */
function serializeRules(source: ValidateSource, rules: RuleMap) {
    // serialize rules
    let arr: Rule | Rule[];
    let value: unknown;
    const series: Record<string, ValidationItem[]> = {};
    const names = Object.keys(rules);
    names.forEach((name) => {
        arr = rules[name];
        value = source[name];

        if (!Array.isArray(arr)) {
            arr = [arr];
        }

        (arr as Rule[]).forEach((rule) => {
            rule.validator = getValidationMethod(rule)!;
            rule.field = name;
            if (!rule.validator) {
                return;
            }
            series[name] = series[name] || [];
            series[name].push({
                rule: rule as SerializedRule,
                value,
                source,
                field: name,
            });
        });
    });

    return series;
}
class Schema {
    _rules: RuleMap | undefined;
    _options: NormalizedOption;
    complete: Array<
        (
            results: Array<NormalizedValidateError | NormalizedValidateError[]>
        ) => void
    >;
    constructor(rules?: RuleMap, options: Option = {}) {
        this._rules = rules;
        this._options = {
            ...options,
            messages: {
                ...defaultMessages,
                ...options.messages,
            },
        };
        this.complete = [];
    }

    abort() {
        for (let i = 0; i < this.complete.length; i++) {
            this.complete[i] = noop;
        }
    }

    messages(messages: MessagesConfig) {
        this._options.messages = Object.assign(
            {},
            this._options.messages,
            messages
        );
    }

    /**
     *
     * @param source - map of field names and values to use in validation
     * @param callback - OPTIONAL - callback to run after all
     * @returns
     *          - { null } - if using callbacks
     *          - { Promise }
     *              - { errors: null } - if no rules or no errors
     *              - { errors: Array, fields: Object } - errors from validation and fields that have errors
     */
    validate(
        source: ValidateSource
    ): ReturnType<(typeof this)['validatePromise']>;
    validate(source: ValidateSource, callback: ValidateCallback): void;
    validate(
        source: ValidateSource,
        callback?: ValidateCallback
    ): Promise<unknown> | void {
        if (!callback) {
            return this.validatePromise(source);
        }

        if (!this._rules || Object.keys(this._rules).length === 0) {
            if (callback) {
                callback(null);
            }
            return;
        }

        const series = serializeRules(source, this._rules);

        if (Object.keys(series).length === 0) {
            callback(null);
        }

        // callback function for all rules return
        function complete(
            results: Array<NormalizedValidateError | NormalizedValidateError[]>
        ) {
            let i: number;
            let field: string;
            let errors: NormalizedValidateError[] = [];
            const fields: Record<string, NormalizedValidateError[]> = {};

            function add(
                e: NormalizedValidateError | NormalizedValidateError[]
            ) {
                if (Array.isArray(e)) {
                    errors = errors.concat(e);
                } else {
                    errors.push(e);
                }
            }

            for (i = 0; i < results.length; i++) {
                add(results[i]);
            }
            if (!errors.length) {
                callback!(null, null);
            } else {
                for (i = 0; i < errors.length; i++) {
                    field = errors[i].field;
                    fields[field] = fields[field] || [];
                    fields[field].push(errors[i]);
                }
                callback!(errors, fields);
            }
        }

        // 这里用数组的原因，是为了方便外部做 abort 调用
        // eg: input onChange 时调用有 异步 validator 被异步调用多次，我们只取最后一次调用。否则可能出现 前一个 validator 返回导致
        this.complete.push(complete);
        const idx = this.complete.length;

        // async validate
        asyncMap(
            series,
            this._options,
            (data, next: (errors: NormalizedValidateError[]) => void) => {
                const rule = data.rule;
                rule.field = data.field;

                const cb: ValidatorCallback = function cb(e) {
                    let errors = e;

                    // fix e=/""/null/undefiend.
                    // ignore e=true/false;
                    if (typeof errors !== 'boolean' && !errors) {
                        errors = [];
                    }

                    if (!Array.isArray(errors)) {
                        errors = [errors];
                    }

                    // 自定义错误
                    if (errors.length && rule.message) {
                        errors = ([] as string[]).concat(rule.message);
                    }

                    errors = errors.map(complementError(rule));

                    next(errors as NormalizedValidateError[]);
                };

                const res = rule.validator(rule, data.value, cb, this._options);
                if (res && res.then) {
                    res.then(
                        () => cb(),
                        (e) => cb(e)
                    );
                }
            },
            (results) => {
                this.complete[idx - 1](results);
            }
        );
    }

    /**
     *
     * @param source - map of field names and values to use in validation
     * @returns
     *          - { errors: null } if no rules or no errors
     *          - { errors: Array, fields: Object } - errors from validation and fields that have errors
     */
    async validatePromise(source: ValidateSource): Promise<
        | { errors: null; fields?: undefined | null }
        | {
              errors: NormalizedValidateError[];
              fields: Record<string, NormalizedValidateError[]>;
          }
    > {
        if (!this._rules || Object.keys(this._rules).length === 0) {
            return { errors: null };
        }

        const series = serializeRules(source, this._rules);

        if (Object.keys(series).length === 0) {
            return { errors: null };
        }

        const results = await asyncMapPromise(
            series,
            this._options,
            async (data) => {
                const rule = data.rule;
                rule.field = data.field;

                let errors: ValidatorCallbackErrors | undefined;

                try {
                    errors = await new Promise<
                        ValidatorCallbackErrors | undefined
                    >((resolve) => {
                        function cb(e?: ValidatorCallbackErrors) {
                            resolve(e);
                        }
                        const res = rule.validator(
                            rule,
                            data.value,
                            cb,
                            this._options
                        );
                        if (res && res.then) {
                            res.then(
                                () => cb(),
                                (e) => cb(e)
                            );
                        }
                    });
                } catch (error) {
                    errors = error;
                }

                if (errors) {
                    // here is unreachable
                    // fix e=/""/null/undefiend.
                    // ignore e=true/false;
                    // if (typeof errors !== 'boolean' && !errors) {
                    //     errors = [];
                    // }

                    if (!Array.isArray(errors)) {
                        errors = [errors];
                    }

                    // 自定义错误
                    if (errors.length && rule.message) {
                        errors = ([] as string[]).concat(rule.message);
                    }

                    return errors.map(complementError(rule));
                } else {
                    return [];
                }
            }
        );

        return processErrorResults(results);
    }
}

export default Schema;
