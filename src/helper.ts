// core modules

// dep modules
import stringify from 'fast-safe-stringify';

// own modules
import { ILogInfo, ILogLevelStreams, LogLevel } from './';

// constants
const pStackLine = /[ \t]+at [^\r\n]+/g;

const helper = {

    type(o: any): string {
        return ({}).toString.call(o).match(/\s(\w+)/i)[1].toLowerCase();
    },

    isset(o: any): boolean {
        return o !== null && o !== undefined;
    },

    isWritableObject(o: any): boolean {
        return typeof o === 'object'
            && typeof (o as any).write === 'function';
    },

    allLevelsWritable(o: ILogLevelStreams): boolean {
        return Object.keys(LogLevel).every((key: string) => {
            const level: string = (LogLevel as any)[key];
            return helper.isWritableObject(o[level]);
        });
    },

    identityFormat(info: ILogInfo): string { // , chalk: Chalk
        return info.text;
    },

    safeStringify(o: any, pretty ?: boolean): string {
        return stringify(o, null, pretty ? 2 : 0);
    },

    str(arr: any[], pretty ?: boolean): string {
        return arr.map(a => helper.safeStringify(a, pretty)).join('\n');
    },

    restack(stack: string, cleanStack: boolean | string[]): any {
        if (typeof stack !== 'string') return stack;

        const stackLines = stack.match(pStackLine);
        if (!stackLines) return stack;

        let message = stack.split(pStackLine)[0] || '';
        message = message.replace(/[\r\n]+$/, '');

        const filteredLines: string[] = [];
        const filterList = Array.isArray(cleanStack) ? cleanStack : [];
        stackLines.forEach((line: string) => {
            const leaveOut =
                // don't include stack-lines with no file path in them.
                !(/.+:\d+:\d+\)/).test(line)
                // if set, don't include stack-lines with ignored keywords in them.
                || (filterList.length > 0 && filterList.some((keyword: string) => line.indexOf(keyword) >= 0));
            // otherwise, add to filtered
            if (!leaveOut) filteredLines.push(line);
        });

        const filteredStack = filteredLines.length > 0
            ? '\n' + filteredLines.join('\n')
            : '';
        // add back the error message and rest of stack
        return message + filteredStack;
    }
};

export { helper };
