/// <reference types="node" />
import * as EventEmitter from 'events';
import { Chalk } from 'chalk';
import { ILogInfo, ILogLevelStreams, ILogOptions, LogEvent, LogFormatFn, LogLevel, LogPriority } from './';
/**
 *  `Tilo` class. A customizable logger and emitter with styles and levels.
 *  @class
 *  @author Onur Yıldırım <onur@cutepilot.com>
 *  @license MIT
 *  @see {@link https://github.com/onury/tilo|GitHub Repo}
 *
 *  @extends EventEmitter
 */
declare class Tilo extends EventEmitter {
    /**
     *  Inner storage.
     *  @protected
     */
    protected $: {
        enabled?: boolean;
        level?: LogLevel;
        priority?: LogPriority;
        format?: LogFormatFn;
        styles?: boolean;
        chalk?: Chalk;
        streams?: ILogLevelStreams;
        cleanStack?: boolean | string[];
    };
    /**
     *  Initializes a new instance of `Tilo` class with the given options.
     *  @param {ILogOptions} [options] - Logging options.
     */
    constructor(options?: ILogOptions);
    /**
     *  Gets the priority number of the given log level.
     *  Lowest number has the highest priority.
     *  @param {Tilo.Level} level - Log level.
     *  @returns {Tilo.Priority}
     */
    static getPriorityOf(level: LogLevel): LogPriority;
    /**
     *  Gets the default format function. You can use this to re-set `#format`.
     *  @type {LogFormatFn}
     *  @readonly
     */
    static readonly defaultFormat: LogFormatFn;
    /**
     *  Specifies whether logs are enabled.
     *  @type {Boolean}
     */
    enabled: boolean;
    /**
     *  Gets or sets the logging level.
     *  @type {Tilo.Level}
     */
    level: LogLevel;
    /**
     *  Gets the priority of the current logging level.
     *  Lowest number is the highest priority.
     *  @type {Tilo.Priority}
     *  @readonly
     */
    readonly priority: LogPriority;
    /**
     *  Gets or sets a function that returns a formatted log string.
     *  @type {LogFormatFn}
     *
     *  @example
     *  const tilo = new Tilo();
     *  tilo.format = (logInfo, chalk) => {
     *      const { date, time, level, text } = logInfo;
     *      const { gray, red, white } = chalk;
     *      const meta = `${gray(date)} ${gray(time)}  ${white(level)} `;
     *      const log = level === 'error' ? red(text) : text;
     *      return meta + log + '\n';
     *  };
     *  tilo.error('Formatted logs...');
     */
    format: LogFormatFn;
    /**
     *  Specifies whether styles and colors are enabled. Useful if you do not
     *  want to change the formatter function but still disable styles.
     *  @type {string}
     */
    styles: boolean;
    /**
     *  If set to `true`, stack lines with no file-path in them will be removed.
     *
     *  You can also pass a list of case-sensitive keywords to be ignored within
     *  the error stacks. Stack lines with any of these keywords in them will be
     *  filtered out. Default: `false`
     *  @type {boolean|string[]}
     */
    cleanStack: boolean | string[];
    /**
     *  Gets the {@link https://github.com/chalk/chalk|Chalk} instance used for
     *  styling.
     *
     *  <blockquote>Note that if `styles` is disabled, this has no affect.</blockquote>
     *  @type {Chalk}
     *  @readonly
     */
    readonly chalk: Chalk;
    /**
     *  Gets or sets the hash-map that defines a stream for each log level. Set
     *  this to an individual `NodeJS.WriteStream` to set it as default for
     *  every log level. By default, the default stream is set to
     *  `process.stdout`.
     *  @type {ILogLevelStreams}
     *
     *  @throws {TypeError} - If `default` stream is not specified implicitly or
     *  explicitly.
     *
     *  @example
     *  // output all levels to stdout
     *  tilo.streams = process.stdout;
     *  // equivalent to:
     *  tilo.streams = { default: process.stdout };
     *  // output all to stdout but error level to stderr
     *  tilo.streams = {
     *      default: process.stdout,
     *      error: process.stderr
     *  };
     */
    streams: ILogLevelStreams;
    /**
     *  Specifies whether we are currently in a CI environment.
     *  @type {boolean}
     *  @readonly
     */
    readonly isInCI: boolean;
    /**
     *  Gets the stream for the given log level.
     *  @param {Tilo.Level} level - Target log level.
     *  @returns {NodeJS.WriteStream}
     */
    getStream(level: LogLevel): NodeJS.WritableStream;
    /**
     *  Writes an `error` log to the corresponding stream.
     *  @param {...any} args - Arguments to be logged.
     *  @emits Tilo~log
     */
    error(...args: any[]): void;
    /**
     *  Writes a `warn` log to the corresponding stream.
     *  @param {...any} args - Arguments to be logged.
     */
    warn(...args: any[]): void;
    /**
     *  Writes an `info` log to the corresponding stream.
     *  @param {...any} args - Arguments to be logged.
     */
    info(...args: any[]): void;
    /**
     *  Alias of `#info()` method. Might be useful for styling/formatting
     *  successful result logs.
     *  @param {...any} args - Arguments to be logged.
     */
    ok(...args: any[]): void;
    /**
     *  Writes an `info` log to the corresponding stream, without any styles or formatting.
     *  @param {...any} args - Arguments to be logged.
     */
    plain(...args: any[]): void;
    /**
     *  Writes a `verbose` log to the corresponding stream.
     *  @param {...any} args - Arguments to be logged.
     */
    verbose(...args: any[]): void;
    /**
     *  Writes a `debug` log to the corresponding stream.
     *  @param {...any} args - Arguments to be logged.
     */
    debug(...args: any[]): void;
    /**
     *  Writes a `debug` log to the corresponding stream; by inspecting
     *  the given object.
     *  @param {any} object - Object to be inspected.
     *  @param {util.InspectOptions} options - Inspect options.
     */
    dir(object: any, options?: any): void;
    /**
     *  Writes a `trace` log to the corresponding (debug) stream.
     *  @param {...any} args - Arguments to be logged.
     */
    trace(...args: any[]): void;
    /**
     *  Prints a table from the given data to the corresponding (info level)
     *  stream.
     *  @param {any[]} data - Table data to be printed. Pass an array of arrays
     *  for rows and columns.
     *  @param {any} [options] - Table options.
     */
    table(data: any[], options?: any): void;
    /**
     *  Writes a `silly` log to the corresponding stream.
     *  @param {...any} args - Arguments to be logged.
     */
    silly(...args: any[]): void;
    /**
     *  Writes the log with the given level to the corresponding stream.
     *  @param {Tilo.Level} level - Log level to be used.
     *  @param {...any} args - Arguments to be logged.
     *
     *  @example
     *  // outputs in warning level logs:
     *  tilo.log('warn', 'message...'); // —» message...
     */
    log(level: LogLevel, ...args: any[]): void;
    /**
     *  Utility method to stringify the given argument(s) safely.
     *  This will automatically handle circular references, if any.
     *  @param {...any} args - Argument(s) to be stringified.
     *  @returns {string}
     *
     *  @example
     *  tilo.debug('Stringify:', tilo.s(obj));
     */
    s(...args: any[]): string;
    /**
     *  Utility method to pretty-stringify the given argument(s) safely.
     *  This will automatically handle circular references, if any.
     *  @param {...any} args - Argument(s) to be stringified.
     *  @returns {string}
     *
     *  @example
     *  tilo.debug('Stringify pretty:', tilo.sp(obj));
     */
    sp(...args: any[]): string;
    /**
     *  Gets the emoji code for the given name (on terminals/streams that
     *  support it). For emoji names, see {@link www.emoji-cheat-sheet.com}.
     *
     *  <blockquote>Note that this method will return the emoji name string, on CI
     *  environments; or if `styles` option is disabled.</blockquote>
     *
     *  @param {string} name - Name of the emoji.
     *  @returns {string}
     *
     *  @example
     *  tilo.info('All done!', tilo.emoji('punch'));
     */
    emoji(name: string): string;
    /**
     *  Checks whether the given level is a valid Tilo log level.
     *  @param {string} level - Level name to be checked.
     *  @returns {boolean}
     */
    isValidLevel(level: string): boolean;
    /**
     *  Plays system beep if the `info` level stream is TTY and called from a
     *  non-CI environment.
     */
    beep(): void;
    /**
     *  Outputs an empty, new line without any meta or formatting.
     */
    newline(): void;
    /**
     *  Gets a log information object for the given log argument(s).
     *  @protected
     *  @param {Tilo.Level} level - Level of the given log.
     *  @param {any[]} args - Log argument(s).
     *  @returns {ILogInfo}
     */
    protected $getLogInfo(method: string, level: LogLevel, args: any[]): ILogInfo;
    /**
     *  Writes a log message (with the given log information) to the specified
     *  log level stream.
     *  @protected
     *  @param {ILogInfo} logInfo - Log message, arguments and other metadata.
     *  @param {boolean} [useFormatter=true] - Whether to use the formatter.
     */
    protected $write(logInfo: ILogInfo, useFormatter?: boolean): void;
}
declare namespace Tilo {
    export import Level = LogLevel;
    export import Priority = LogPriority;
    export import Event = LogEvent;
}
export { Tilo };
