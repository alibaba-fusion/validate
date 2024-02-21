import * as util from '../util';
import type { PresetValidator } from '../types';

const pattern = {
    email: /[\w\u4E00-\u9FA5]+([-+.][\w\u4E00-\u9FA5]+)*@[\w\u4E00-\u9FA5]+([-.][\w\u4E00-\u9FA5]+)*\.[\w\u4E00-\u9FA5]+([-.][\w\u4E00-\u9FA5]+)*/,
    url: /^(?:(?:http|https|ftp):\/\/|\/\/)(?:(?:(?:[-\w\u00a1-\uffff]+)(?:\.[-\w\u00a1-\uffff]+)+|localhost)(?::\d{2,5})?(?:(?:\/|#)[^\s]*)?)$/,
    number: /\d*/,
    tel: /^(1\d{10})$|(((400)-(\d{3})-(\d{4}))|^((\d{7,8})|(\d{3,4})-(\d{7,8})|(\d{7,8})-(\d{1,4}))$)$|^([ ]?)$/,
};

/**
 * 函数参数必须是字符串，因为二代身份证号码是十八位，而在 javascript 中，十八位的数值会超出计算范围，造成不精确的结果，
 * 导致最后两位和计算的值不一致，从而该函数出现错误（详情查看 javascript 的数值范围）。
 * 为了避免这一误差，idcode 必须是字符串
 *
 * 正则思路：
 *   第一位不可能是 0
 *   第二位到第六位可以是 0-9
 *   第七位到第十位是年份，所以七八位为 19 或者 20
 *   十一位和十二位是月份，这两位是 01-12 之间的数值
 *   十三位和十四位是日期，是从 01-31 之间的数值
 *   十五，十六，十七都是数字 0-9
 *   十八位可能是数字 0-9，也可能是 X
 * */
function validatorIDNumber(idCode: unknown) {
    if (typeof idCode !== 'string') {
        return false;
    }
    const idCardPatter =
        /^[1-9][0-9]{5}([1][9][0-9]{2}|[2][0][0|1][0-9])([0][1-9]|[1][0|1|2])([0][1-9]|[1|2][0-9]|[3][0|1])[0-9]{3}([0-9]|[X])$/;
    // 判断格式是否正确
    const format = idCardPatter.test(idCode);
    if (!format) {
        return false;
    }
    // 加权因子
    const weightFactor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    // 校验码
    const checkCode = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    const last = idCode[17]; //最后一位
    const seventeen = idCode.substring(0, 17);
    // ISO 7064:1983.MOD 11-2
    // 判断最后一位校验码是否正确
    const arr = seventeen.split('');
    const len = arr.length;
    let num = 0;
    for (let i = 0; i < len; i++) {
        // @ts-expect-error string * number
        num += arr[i] * weightFactor[i];
    }
    // 获取余数
    const lastNo = checkCode[num % 11];
    // 返回验证结果，校验码和格式同时正确才算是合法的身份证号码
    return last === lastNo;
}

const types = {
    number(value: unknown) {
        if (isNaN(value as number)) {
            return false;
        }
        return (
            typeof value === 'number' ||
            (typeof value === 'string' && !!value.match(pattern.number))
        );
    },
    email(value: unknown) {
        return (
            typeof value === 'string' &&
            !!value.match(pattern.email) &&
            value.length < 255
        );
    },
    url(value: unknown) {
        return typeof value === 'string' && !!value.match(pattern.url);
    },
    tel(value: unknown) {
        return typeof value === 'string' && !!value.match(pattern.tel);
    },
    IDNumber(value: unknown) {
        return validatorIDNumber(value);
    },
};

/**
 *  Rule for validating the type of a value.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param errors An array of errors that this rule may add
 *  validation errors to.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */
const format: PresetValidator = function format(rule, value, errors, options) {
    const custom = ['email', 'number', 'url', 'tel', 'IDNumber'];
    const ruleType = rule.format!;
    if (custom.indexOf(ruleType) > -1 && !types[ruleType](value)) {
        errors.push(
            util.format(
                options.messages.format[ruleType],
                rule.aliasName || rule.field,
                rule.format
            )
        );
    }
};

export default format;
