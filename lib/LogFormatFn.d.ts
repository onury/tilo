import { Chalk } from 'chalk';
import { ILogInfo } from './';
/**
 *  Log format function.
 *  @param {ILogInfo} info - Log information object.
 *  @param {Chalk} chalk - Chalk instance for styling and coloring the output.
 *  @returns {string}
 */
declare type LogFormatFn = (info: ILogInfo, chalk: Chalk) => string;
export { LogFormatFn };
