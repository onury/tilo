/// <reference types="node" />
import { ILogLevelStreams, LogFormatFn, LogLevel } from './';
/**
 *  Interface for log options.
 */
interface ILogOptions {
    /**
     *  Specifies whether logs are enabled. Default: `true`
     *  @type {Boolean}
     */
    enabled?: boolean;
    /**
     *  Log level to be set for the logger. Default: `Tilo.Level.DEBUG`
     *  @type {Tilo.Level}
     */
    level?: LogLevel;
    /**
     *  The formatter function for styling and coloring the log output. If not
     *  set, the default formatter function will be used.
     *  @type {LogFormatFn}
     */
    format?: LogFormatFn;
    /**
     *  Whether styles and colors are enabled. Useful if you do not want to
     *  change the formatter function but still disable styles. Default: `true`
     *  @type {boolean}
     */
    styles?: boolean;
    /**
     *  A hash-map of objects that defines write streams for each individual log
     *  level. If a single stream is set, it will be used as default for each
     *  log level.
     *  @type {ILogLevelStreams|NodeJS.WritableStream}
     */
    streams?: ILogLevelStreams | NodeJS.WritableStream;
    /**
     *  If set to `true`, stack lines with no file-path in them will be removed.
     *
     *  You can also pass a list of case-sensitive keywords to be ignored within
     *  the error stacks. Stack lines with any of these keywords in them will be
     *  filtered out. Default: `false`
     *  @type {boolean|string[]}
     */
    cleanStack?: boolean | string[];
}
export { ILogOptions };
