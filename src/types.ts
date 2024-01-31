import type PresetMessages from './messages';

export type ValidatorCallbackErrors =
    | ValidateError
    | Array<ValidateError | string>
    | string;

export type ValidatorCallback = (
    errors?: ValidatorCallbackErrors | null
) => void;

export type Validator = (
    rule: SerializedRule,
    value: unknown,
    callback: ValidatorCallback,
    options: NormalizedOption
) => void | Promise<ValidateError[] | void | null>;

export type PresetValidator = (
    rule: SerializedRule,
    value: unknown,
    errors: Array<ValidateError | string>,
    options: PresetOption
) => unknown;

export type PresetFormatter = 'email' | 'number' | 'url' | 'tel' | 'IDNumber';

export interface PresetValidatorRule {
    required: boolean;
    format: PresetFormatter;
    min: number;
    max: number;
    minLength: number;
    maxLength: number;
    length: number;
    pattern: RegExp | string;
}

export interface Rule extends Partial<PresetValidatorRule> {
    aliasName?: string;
    field?: string;
    validator?: Validator;
    message?: string;
    [key: string]: unknown;
}

export interface SerializedRule extends Rule {
    field: string;
    validator: Validator;
}

export type RuleMap = Record<string, Rule | Rule[]>;

export type ValidateSource = Record<string, unknown>;

export interface ValidationItem {
    rule: SerializedRule;
    value: unknown;
    source: ValidateSource;
    field: string;
}

export type PresetMessagesConfig = typeof PresetMessages;

export type MessageFunction = (
    args: [field: string, ...others: unknown[]]
) => string;

export type MessagesConfig = {
    [key: string]:
        | MessageFunction
        | string
        | Record<string, string | MessageFunction>;
};

export interface Option {
    first?: boolean;
    messages?: MessagesConfig;
}
export interface NormalizedOption extends Option {
    messages: MessagesConfig;
}

export interface PresetOption extends Omit<Option, 'messages'> {
    messages: PresetMessagesConfig;
}

export interface ValidateError {
    message: string;
}

export interface NormalizedValidateError {
    field: string;
    message: string;
}

export type ValidateCallback = (
    errors: ValidateError[] | null,
    fields?: Record<string, ValidateError[]> | null
) => void;

export type ErrorCallback = (
    errors: Array<NormalizedValidateError | NormalizedValidateError[]>
) => void;

export type InnerValidator = (
    rule: ValidationItem
) => NormalizedValidateError[] | Promise<NormalizedValidateError[]>;

export type ValidationNoErrorResult = {
    errors: null;
    fields?: undefined | null;
};
export type ValidationErrorResult = {
    errors: NormalizedValidateError[];
    fields: Record<string, NormalizedValidateError[]>;
};
