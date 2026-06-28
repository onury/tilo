import type { ChalkInstance } from 'chalk';
import type { ILogInfo } from './index.js';

/**
 *  Log format function.
 *  @param {ILogInfo} info - Log information object.
 *  @param {Chalk} chalk - {@link https://github.com/chalk/chalk|Chalk} instance
 *  for styling and coloring the output.
 *  @returns {string}
 */
type LogFormatFn = (info: ILogInfo, chalk: ChalkInstance) => string;

export type { LogFormatFn };
