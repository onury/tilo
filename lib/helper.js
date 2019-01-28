"use strict";
// core modules
Object.defineProperty(exports, "__esModule", { value: true });
// dep modules
const fast_safe_stringify_1 = require("fast-safe-stringify");
// own modules
const _1 = require("./");
// constants
const pStackLine = /[ \t]+at [^\r\n]+/g;
const helper = {
    type(o) {
        return ({}).toString.call(o).match(/\s(\w+)/i)[1].toLowerCase();
    },
    isset(o) {
        return o !== null && o !== undefined;
    },
    isWritableObject(o) {
        return typeof o === 'object'
            && typeof o.write === 'function';
    },
    allLevelsWritable(o) {
        return Object.keys(_1.LogLevel).every((key) => {
            const level = _1.LogLevel[key];
            return helper.isWritableObject(o[level]);
        });
    },
    identityFormat(info) {
        return info.text;
    },
    safeStringify(o, pretty) {
        return fast_safe_stringify_1.default(o, null, pretty ? 2 : 0);
    },
    str(arr, pretty) {
        return arr.map(a => helper.safeStringify(a, pretty)).join('\n');
    },
    restack(stack, cleanStack) {
        if (typeof stack !== 'string')
            return stack;
        const stackLines = stack.match(pStackLine);
        if (!stackLines)
            return stack;
        let message = stack.split(pStackLine)[0] || '';
        message = message.replace(/[\r\n]+$/, '');
        const filteredLines = [];
        const filterList = Array.isArray(cleanStack) ? cleanStack : [];
        stackLines.forEach((line) => {
            const leaveOut = 
            // don't include stack-lines with no file path in them.
            !(/.+:\d+:\d+\)/).test(line)
                // if set, don't include stack-lines with ignored keywords in them.
                || (filterList.length > 0 && filterList.some((keyword) => line.indexOf(keyword) >= 0));
            // otherwise, add to filtered
            if (!leaveOut)
                filteredLines.push(line);
        });
        const filteredStack = filteredLines.length > 0
            ? '\n' + filteredLines.join('\n')
            : '';
        // add back the error message and rest of stack
        return message + filteredStack;
    }
};
exports.helper = helper;
