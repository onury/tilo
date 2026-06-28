import type { ChalkInstance } from 'chalk';
import type { ILogInfo } from './index.js';

/**
 *  Function that builds the formatted log string from a log info object.
 *  @param info - Log information object.
 *  @param chalk - {@link https://github.com/chalk/chalk | Chalk} instance for
 *  styling and coloring the output.
 *  @returns The formatted log string to be written to the stream.
 */
type LogFormatFn = (info: ILogInfo, chalk: ChalkInstance) => string;

export type { LogFormatFn };
