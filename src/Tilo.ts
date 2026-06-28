// core modules

import { EventEmitter } from 'node:events';
import * as util from 'node:util';
// dep modules
import chalk, { Chalk, type ChalkInstance } from 'chalk';
import { isCI } from 'ci-info';
import { get as getEmoji } from 'node-emoji';
import { table } from 'table';
import { helper } from './helper.js';
// own modules
import type { ILogInfo, ILogLevelStreams, ILogOptions, LogFormatFn } from './index.js';
import { LogEvent, LogLevel, LogPriority } from './index.js';

// constants

// below color map is by level
const defaultLevelColor: any = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  verbose: 'cyan',
  debug: 'magenta',
  silly: 'gray'
};
// below color map is by method name
const defaultMsgColor: any = {
  ok: 'green'
};

const disabledChalk: ChalkInstance = new Chalk({ level: 0 });
const reStackLines = /([ \t]+at.*?)(?:([^:/\\( ]+):(\d+):(\d+))?(\)?)([\r\n]|$)/g;

const DEFAULT_FORMAT_FN = (info: ILogInfo, clk: ChalkInstance): string => {
  const datetime = clk.gray(info.date) + ' ' + clk.white(info.time);
  const levelStyle = clk[defaultLevelColor[info.level]];
  const methodColor = defaultMsgColor[info.method];
  const msgStyle = methodColor ? clk[methodColor] : levelStyle;
  const verboseOrSilly = info.level === LogLevel.VERBOSE || info.level === LogLevel.SILLY;

  let level = levelStyle((info.level.toUpperCase() + '     ').slice(0, 5));
  if (!verboseOrSilly) level = clk.bold(level);

  const meta = datetime + '  ' + level + '  ';

  const text = info.text;
  if (clk.level > 0) {
    const m = text.match(/([\r\n][ \t]+at[\s\S]*$)/);
    if (m) {
      const p = text.split(/([\r\n][ \t]+at.*)/g);
      const message = msgStyle(p[0]);
      const stack = m[0].replace(
        reStackLines,
        (s: string, $1: string, $2: string, $3: string, $4: string, $5: string, $6: string) => {
          let lineInfo = '';
          if ($2) {
            lineInfo =
              clk.yellow($2) +
              ':' +
              clk.white($3) +
              ':' +
              clk.white($4) +
              clk.gray($5 || /* istanbul ignore next */ '');
          }
          return clk.gray($1) + lineInfo + $6;
        }
      );
      return meta + message + stack + '\n';
    }
  }
  return meta + msgStyle(text) + '\n';
};

/**
 *  A customizable logger and event emitter with styles and levels.
 *
 *  @remarks
 *  Extends Node's `EventEmitter`, emitting the {@link LogEvent.LOG} event on
 *  every log attempt.
 *
 *  @see {@link https://github.com/onury/tilo | GitHub Repo}
 */
class Tilo extends EventEmitter {
  /**
   *  Inner storage.
   */
  protected $: {
    enabled?: boolean;
    level?: LogLevel;
    priority?: LogPriority;
    format?: LogFormatFn;
    styles?: boolean;
    chalk?: ChalkInstance;
    streams?: ILogLevelStreams;
    cleanStack?: boolean | string[];
  };

  /**
   *  Initializes a new instance of the {@link Tilo} class with the given
   *  options.
   *  @param options - Logging options.
   */
  constructor(options?: ILogOptions) {
    super(); // EventEmitter

    options = options || {};
    this.$ = {};
    this.enabled = 'enabled' in options ? Boolean(options.enabled) : true;
    this.level = options.level || LogLevel.DEBUG;
    this.styles = 'styles' in options ? Boolean(options.styles) : true;
    this.format = 'format' in options ? (options.format as LogFormatFn) : Tilo.defaultFormat;
    this.streams = options.streams as any;
    this.cleanStack = options.cleanStack as boolean | string[];
  }

  /**
   *  Gets the priority number of the given log level. The lowest number has
   *  the highest priority.
   *  @param level - Log level.
   *  @returns The priority of the given level.
   */
  static getPriorityOf(level: LogLevel): LogPriority {
    return LogPriority[level.toUpperCase()];
  }

  /**
   *  Gets the default format function. You can use this to re-set
   *  {@link Tilo.format}.
   *  @readonly
   */
  static get defaultFormat(): LogFormatFn {
    return DEFAULT_FORMAT_FN;
  }

  /**
   *  Gets or sets whether logs are enabled.
   */
  get enabled(): boolean {
    return this.$.enabled!;
  }
  set enabled(value: boolean) {
    this.$.enabled = Boolean(value);
  }

  /**
   *  Gets or sets the logging level. See {@link LogLevel}.
   */
  get level(): LogLevel {
    return this.$.level!;
  }
  set level(value: LogLevel) {
    this.$.level = value;
    this.$.priority = Tilo.getPriorityOf(value);
  }

  /**
   *  Gets the priority of the current logging level. The lowest number is the
   *  highest priority. See {@link LogPriority}.
   *  @readonly
   */
  get priority(): LogPriority {
    return this.$.priority!;
  }

  /**
   *  Gets or sets a function that returns a formatted log string. See
   *  {@link LogFormatFn}.
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
  get format(): LogFormatFn {
    return this.$.format!;
  }
  set format(value: LogFormatFn) {
    this.$.format = value;
  }

  /**
   *  Gets or sets whether styles and colors are enabled. Useful if you do not
   *  want to change the formatter function but still disable styles.
   */
  get styles(): boolean {
    return this.$.styles!;
  }
  set styles(value: boolean) {
    this.$.styles = Boolean(value);
    // this.$.chalk = new chalk.constructor({ enabled: value });
    this.$.chalk = value ? chalk : disabledChalk;
  }

  /**
   *  If set to `true`, stack lines with no file-path in them will be removed.
   *
   *  You can also pass a list of case-sensitive keywords to be ignored within
   *  the error stacks. Stack lines with any of these keywords in them will be
   *  filtered out. Default: `false`
   */
  get cleanStack(): boolean | string[] {
    return this.$.cleanStack!;
  }
  set cleanStack(value: boolean | string[]) {
    this.$.cleanStack = value === true || Array.isArray(value) ? value : false;
  }

  /**
   *  Gets the {@link https://github.com/chalk/chalk | Chalk} instance used for
   *  styling.
   *
   *  @remarks
   *  If `styles` is disabled, this has no effect.
   *  @readonly
   */
  get chalk(): ChalkInstance {
    return this.$.chalk!;
  }

  /**
   *  Gets or sets the hash-map that defines a stream for each log level. Set
   *  this to an individual `NodeJS.WriteStream` to set it as default for
   *  every log level. By default, the default stream is set to
   *  `process.stdout`. See {@link ILogLevelStreams}.
   *
   *  @throws {@link TypeError} if the `default` stream is not specified
   *  implicitly or explicitly.
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
  get streams(): ILogLevelStreams {
    return this.$.streams!;
  }
  set streams(value: ILogLevelStreams) {
    if (!helper.isset(value)) {
      this.$.streams = { default: process.stdout } as ILogLevelStreams;
      return;
    }
    if (helper.isWritableObject(value)) {
      this.$.streams = { default: value } as ILogLevelStreams;
      return;
    }
    const ok =
      helper.type(value) === 'object' &&
      (helper.isWritableObject(value.default) || helper.allLevelsWritable(value));
    if (!ok) {
      throw new TypeError('No default stream is specified.');
    }
    this.$.streams = value;
  }

  /**
   *  Specifies whether we are currently in a CI environment.
   *  @readonly
   */
  get isInCI(): boolean {
    return isCI;
  }

  /**
   *  Gets the stream for the given log level.
   *  @param level - Target log level.
   *  @returns The writable stream for the given level.
   */
  getStream(level: LogLevel): NodeJS.WritableStream {
    return this.$.streams![level] || this.$.streams!.default!;
  }

  /**
   *  Writes an `error` log to the corresponding stream.
   *  @param args - Arguments to be logged.
   */
  error(...args: any[]): void {
    if (!this.enabled) return;
    const log = this.$getLogInfo('error', LogLevel.ERROR, args);
    this.$write(log);
  }

  /**
   *  Writes a `warn` log to the corresponding stream.
   *  @param args - Arguments to be logged.
   */
  warn(...args: any[]): void {
    if (!this.enabled) return;
    const log = this.$getLogInfo('warn', LogLevel.WARN, args);
    this.$write(log);
  }

  /**
   *  Writes an `info` log to the corresponding stream.
   *  @param args - Arguments to be logged.
   */
  info(...args: any[]): void {
    if (!this.enabled) return;
    const log = this.$getLogInfo('info', LogLevel.INFO, args);
    this.$write(log);
  }

  /**
   *  Alias of the {@link Tilo.info} method. Might be useful for
   *  styling/formatting successful result logs.
   *  @param args - Arguments to be logged.
   */
  ok(...args: any[]): void {
    if (!this.enabled) return;
    const log = this.$getLogInfo('ok', LogLevel.INFO, args);
    this.$write(log);
  }

  /**
   *  Writes an `info` log to the corresponding stream, without any styles or
   *  formatting.
   *  @param args - Arguments to be logged.
   */
  plain(...args: any[]): void {
    if (!this.enabled) return;
    const log = this.$getLogInfo('plain', LogLevel.INFO, args);
    this.$write(log, false);
  }

  /**
   *  Writes a `verbose` log to the corresponding stream.
   *  @param args - Arguments to be logged.
   */
  verbose(...args: any[]): void {
    if (!this.enabled) return;
    const log = this.$getLogInfo('verbose', LogLevel.VERBOSE, args);
    this.$write(log);
  }

  /**
   *  Writes a `debug` log to the corresponding stream.
   *  @param args - Arguments to be logged.
   */
  debug(...args: any[]): void {
    if (!this.enabled) return;
    const log = this.$getLogInfo('debug', LogLevel.DEBUG, args);
    this.$write(log);
  }

  /**
   *  Writes a `debug` log to the corresponding stream, by inspecting the given
   *  object.
   *  @param object - Object to be inspected.
   *  @param options - Inspect options (`util.InspectOptions`).
   */
  dir(object: any, options?: any): void {
    if (!this.enabled) return;

    options = {
      customInspect: false,
      ...(options || {})
    };
    const log = this.$getLogInfo('dir', LogLevel.DEBUG, [`${util.inspect(object, options)}\n`]);
    this.$write(log);
  }

  /**
   *  Writes a `trace` log to the corresponding (debug) stream.
   *  @param args - Arguments to be logged.
   */
  trace(...args: any[]): void {
    if (!this.enabled) return;

    // from Node source
    const err = new Error();
    err.name = '[TRACE]';
    err.message = util.format.apply(null, args);
    Error.captureStackTrace(err, this.trace);

    const log = this.$getLogInfo('trace', LogLevel.DEBUG, [err.stack]);
    this.$write(log);
  }

  /**
   *  Prints a table from the given data to the corresponding (info level)
   *  stream.
   *  @param data - Table data to be printed. Pass an array of arrays for rows
   *  and columns.
   *  @param options - Table options.
   */
  table(data: any[], options?: any): void {
    if (!this.enabled) return;

    const text: string = table(data, options);
    const log = this.$getLogInfo('table', LogLevel.INFO, [text]);
    this.$write(log, false);
  }

  /**
   *  Writes a `silly` log to the corresponding stream.
   *  @param args - Arguments to be logged.
   */
  silly(...args: any[]): void {
    if (!this.enabled) return;
    const log = this.$getLogInfo('silly', LogLevel.SILLY, args);
    this.$write(log);
  }

  /**
   *  Writes the log with the given level to the corresponding stream.
   *  @param level - Log level to be used.
   *  @param args - Arguments to be logged.
   *
   *  @example
   *  // outputs in warning level logs:
   *  tilo.log('warn', 'message...'); // —» message...
   */
  log(level: LogLevel, ...args: any[]): void {
    if (!this.enabled) return;
    if (!this.isValidLevel(level)) {
      args.unshift(level);
      level = LogLevel.INFO;
    }
    const log = this.$getLogInfo('log', level, args);
    this.$write(log);
  }

  /**
   *  Utility method to stringify the given argument(s) safely. This
   *  automatically handles circular references, if any.
   *  @param args - Argument(s) to be stringified.
   *  @returns The stringified argument(s).
   *
   *  @example
   *  tilo.debug('Stringify:', tilo.s(obj));
   */
  s(...args: any[]): string {
    return helper.str(args);
  }

  /**
   *  Utility method to pretty-stringify the given argument(s) safely. This
   *  automatically handles circular references, if any.
   *  @param args - Argument(s) to be stringified.
   *  @returns The pretty-stringified argument(s).
   *
   *  @example
   *  tilo.debug('Stringify pretty:', tilo.sp(obj));
   */
  sp(...args: any[]): string {
    return helper.str(args, true);
  }

  /**
   *  Gets the emoji code for the given name (on terminals/streams that
   *  support it). For emoji names, see
   *  {@link https://www.webfx.com/tools/emoji-cheat-sheet/ | the emoji cheat
   *  sheet}.
   *
   *  @remarks
   *  This method returns the emoji name string in CI environments, or if the
   *  `styles` option is disabled.
   *
   *  @param name - Name of the emoji.
   *  @returns The emoji character, or the emoji name string.
   *
   *  @example
   *  tilo.info('All done!', tilo.emoji('punch'));
   */
  /* istanbul ignore next */
  emoji(name: string): string {
    // below is actually tested but emoji is disabled in CI env.
    const s = name.trim().replace(/(^:|:$)/g, '');
    if (this.isInCI || !this.styles) return ':' + s + ':';
    return s ? (getEmoji(s) ?? name) : name;
  }

  /**
   *  Checks whether the given level is a valid Tilo log level.
   *  @param level - Level name to be checked.
   *  @returns Whether the given level is a valid log level.
   */
  isValidLevel(level: string): boolean {
    return Object.keys(LogLevel).some((key: string) => LogLevel[key] === level);
  }

  /**
   *  Plays system beep if the `info` level stream is TTY and called from a
   *  non-CI environment.
   */
  /* istanbul ignore next */
  beep(): void {
    // disabled in CI env.
    if (!this.enabled || this.isInCI) return;
    const stream: any = this.getStream(LogLevel.INFO);
    /* istanbul ignore next */
    if (!stream || !('isTTY' in stream) || !stream.isTTY) return;
    /* istanbul ignore next */
    stream.write('\u0007');
  }

  /**
   *  Outputs an empty, new line without any meta or formatting.
   */
  newline(): void {
    if (!this.enabled) return;
    const stream: any = this.getStream(LogLevel.INFO);
    /* istanbul ignore else */
    if (stream) stream.write('\n');
  }

  /**
   *  Gets a log information object for the given log argument(s).
   *  @param method - Name of the method that produced the log.
   *  @param level - Level of the given log.
   *  @param args - Log argument(s).
   *  @returns The assembled log information object.
   */
  protected $getLogInfo(method: string, level: LogLevel, args: any[]): ILogInfo {
    const d = new Date();
    const dateISO = d.toISOString();
    const date = dateISO.slice(0, 10);
    const time = dateISO.slice(11, 19);

    // check if any arg looks like stack trace string, update if so. we
    // won't do this for trace/debug logs.
    if (method !== 'trace' && this.$.cleanStack) {
      args = args.map((arg: any) => helper.restack(arg, this.$.cleanStack!));
    }

    const priority = Tilo.getPriorityOf(level);

    return {
      level,
      priority,
      levelEnabled: this.priority >= priority,
      stream: this.getStream(level),
      timestamp: d.getTime(),
      date,
      time,
      text: util.format.apply(util, args),
      args,
      method
    };
  }

  /**
   *  Writes a log message (with the given log information) to the specified
   *  log level stream.
   *  @param logInfo - Log message, arguments and other metadata.
   *  @param useFormatter - Whether to use the formatter. Default: `true`
   */
  protected $write(logInfo: ILogInfo, useFormatter: boolean = true): void {
    const { levelEnabled, stream } = logInfo;
    if (levelEnabled && stream) {
      // we'll pass logInfo to formatter and emitter...
      // format the output / or not...
      const log = useFormatter
        ? this.format
          ? this.format(logInfo, this.chalk)
          : helper.identityFormat(logInfo)
        : (logInfo.text ?? '');
      // write the log to corresponding stream of the log level
      stream.write(log);
    }

    // if (this.listenerCount(LogEvent.LOG) <= 0) return;

    // Emit the `log` event ({@link LogEvent.LOG}) with the {@link ILogInfo}
    // object on every log attempt, even when the level is not enabled.
    this.emit(LogEvent.LOG, logInfo);
  }
}

// -------------------------------
// EXPORT
// -------------------------------

/* istanbul ignore next */
namespace Tilo {
  // https://github.com/Microsoft/TypeScript/issues/3832#issuecomment-121024254
  export import Level = LogLevel;
  export import Priority = LogPriority;
  export import Event = LogEvent;
}

export { Tilo };
