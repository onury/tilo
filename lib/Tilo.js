"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// core modules
const events_1 = require("events");
const util = require("util");
// dep modules
const chalk = require("chalk");
const ci = require("ci-info");
const emoji = require("node-emoji");
const table_1 = require("table");
// own modules
const _1 = require("./");
const helper_1 = require("./helper");
// constants
// below color map is by level
const defaultLevelColor = {
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    verbose: 'cyan',
    debug: 'magenta',
    silly: 'gray'
};
// below color map is by method name
const defaultMsgColor = {
    ok: 'green'
};
const disabledChalk = new chalk.Instance({ level: 0 });
const reStackLines = /([ \t]+at.*?)(?:([^:/\\( ]+):(\d+):(\d+))?(\)?)([\r\n]|$)/g;
const DEFAULT_FORMAT_FN = (info, clk) => {
    const datetime = clk.gray(info.date) + ' ' + clk.white(info.time);
    const levelStyle = clk[defaultLevelColor[info.level]];
    const methodColor = defaultMsgColor[info.method];
    const msgStyle = methodColor ? clk[methodColor] : levelStyle;
    const verboseOrSilly = (info.level === _1.LogLevel.VERBOSE || info.level === _1.LogLevel.SILLY);
    let level = levelStyle((info.level.toUpperCase() + '     ').slice(0, 5));
    if (!verboseOrSilly)
        level = clk.bold(level);
    const meta = datetime + '  ' + level + '  ';
    const text = info.text;
    if (clk.level > 0) {
        const m = text.match(/([\r\n][ \t]+at[\s\S]*$)/);
        if (m) {
            const p = text.split(/([\r\n][ \t]+at.*)/g);
            const message = msgStyle(p[0]);
            // tslint:disable-next-line max-line-length
            const stack = m[0].replace(reStackLines, (s, $1, $2, $3, $4, $5, $6) => {
                let lineInfo = '';
                if ($2) {
                    lineInfo = clk.yellow($2) + ':' + clk.white($3) + ':' + clk.white($4)
                        + clk.gray($5 || /* istanbul ignore next */ '');
                }
                return clk.gray($1) + lineInfo + $6;
            });
            return meta + message + stack + '\n';
        }
    }
    return meta + msgStyle(text) + '\n';
};
/**
 *  `Tilo` class. A customizable logger and emitter with styles and levels.
 *  @class
 *  @author Onur Yıldırım <onur@cutepilot.com>
 *  @license MIT
 *  @see {@link https://github.com/onury/tilo|GitHub Repo}
 *
 *  @extends EventEmitter
 */
class Tilo extends events_1.EventEmitter {
    /**
     *  Initializes a new instance of `Tilo` class with the given options.
     *  @param {ILogOptions} [options] - Logging options.
     */
    constructor(options) {
        super(); // EventEmitter
        options = options || {};
        this.$ = {};
        this.enabled = 'enabled' in options ? Boolean(options.enabled) : true;
        this.level = options.level || _1.LogLevel.DEBUG;
        this.styles = 'styles' in options ? Boolean(options.styles) : true;
        this.format = 'format' in options
            ? options.format
            : Tilo.defaultFormat;
        this.streams = options.streams;
        this.cleanStack = options.cleanStack;
    }
    /**
     *  Gets the priority number of the given log level.
     *  Lowest number has the highest priority.
     *  @param {Tilo.Level} level - Log level.
     *  @returns {Tilo.Priority}
     */
    static getPriorityOf(level) {
        return _1.LogPriority[level.toUpperCase()];
    }
    /**
     *  Gets the default format function. You can use this to re-set `#format`.
     *  @type {LogFormatFn}
     *  @readonly
     */
    static get defaultFormat() {
        return DEFAULT_FORMAT_FN;
    }
    /**
     *  Specifies whether logs are enabled.
     *  @type {Boolean}
     */
    get enabled() {
        return this.$.enabled;
    }
    set enabled(value) {
        this.$.enabled = Boolean(value);
    }
    /**
     *  Gets or sets the logging level.
     *  @type {Tilo.Level}
     */
    get level() {
        return this.$.level;
    }
    set level(value) {
        this.$.level = value;
        this.$.priority = Tilo.getPriorityOf(value);
    }
    /**
     *  Gets the priority of the current logging level.
     *  Lowest number is the highest priority.
     *  @type {Tilo.Priority}
     *  @readonly
     */
    get priority() {
        return this.$.priority;
    }
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
    get format() {
        return this.$.format;
    }
    set format(value) {
        this.$.format = value;
    }
    /**
     *  Specifies whether styles and colors are enabled. Useful if you do not
     *  want to change the formatter function but still disable styles.
     *  @type {string}
     */
    get styles() {
        return this.$.styles;
    }
    set styles(value) {
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
     *  @type {boolean|string[]}
     */
    get cleanStack() {
        return this.$.cleanStack;
    }
    set cleanStack(value) {
        this.$.cleanStack = value === true || Array.isArray(value)
            ? value
            : false;
    }
    /**
     *  Gets the {@link https://github.com/chalk/chalk|Chalk} instance used for
     *  styling.
     *
     *  <blockquote>Note that if `styles` is disabled, this has no affect.</blockquote>
     *  @type {Chalk}
     *  @readonly
     */
    get chalk() {
        return this.$.chalk;
    }
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
    get streams() {
        return this.$.streams;
    }
    set streams(value) {
        if (!helper_1.helper.isset(value)) {
            this.$.streams = { default: process.stdout };
            return;
        }
        if (helper_1.helper.isWritableObject(value)) {
            this.$.streams = { default: value };
            return;
        }
        const ok = helper_1.helper.type(value) === 'object'
            && (helper_1.helper.isWritableObject(value.default)
                || helper_1.helper.allLevelsWritable(value));
        if (!ok) {
            throw new TypeError('No default stream is specified.');
        }
        this.$.streams = value;
    }
    /**
     *  Specifies whether we are currently in a CI environment.
     *  @type {boolean}
     *  @readonly
     */
    get isInCI() {
        return ci.isCI;
    }
    /**
     *  Gets the stream for the given log level.
     *  @param {Tilo.Level} level - Target log level.
     *  @returns {NodeJS.WriteStream}
     */
    getStream(level) {
        return this.$.streams[level] || this.$.streams.default;
    }
    /**
     *  Writes an `error` log to the corresponding stream.
     *  @param {...any} args - Arguments to be logged.
     *  @emits Tilo~log
     */
    error(...args) {
        if (!this.enabled)
            return;
        const log = this.$getLogInfo('error', _1.LogLevel.ERROR, args);
        this.$write(log);
    }
    /**
     *  Writes a `warn` log to the corresponding stream.
     *  @param {...any} args - Arguments to be logged.
     */
    warn(...args) {
        if (!this.enabled)
            return;
        const log = this.$getLogInfo('warn', _1.LogLevel.WARN, args);
        this.$write(log);
    }
    /**
     *  Writes an `info` log to the corresponding stream.
     *  @param {...any} args - Arguments to be logged.
     */
    info(...args) {
        if (!this.enabled)
            return;
        const log = this.$getLogInfo('info', _1.LogLevel.INFO, args);
        this.$write(log);
    }
    /**
     *  Alias of `#info()` method. Might be useful for styling/formatting
     *  successful result logs.
     *  @param {...any} args - Arguments to be logged.
     */
    ok(...args) {
        if (!this.enabled)
            return;
        const log = this.$getLogInfo('ok', _1.LogLevel.INFO, args);
        this.$write(log);
    }
    /**
     *  Writes an `info` log to the corresponding stream, without any styles or formatting.
     *  @param {...any} args - Arguments to be logged.
     */
    plain(...args) {
        if (!this.enabled)
            return;
        const log = this.$getLogInfo('plain', _1.LogLevel.INFO, args);
        this.$write(log, false);
    }
    /**
     *  Writes a `verbose` log to the corresponding stream.
     *  @param {...any} args - Arguments to be logged.
     */
    verbose(...args) {
        if (!this.enabled)
            return;
        const log = this.$getLogInfo('verbose', _1.LogLevel.VERBOSE, args);
        this.$write(log);
    }
    /**
     *  Writes a `debug` log to the corresponding stream.
     *  @param {...any} args - Arguments to be logged.
     */
    debug(...args) {
        if (!this.enabled)
            return;
        const log = this.$getLogInfo('debug', _1.LogLevel.DEBUG, args);
        this.$write(log);
    }
    /**
     *  Writes a `debug` log to the corresponding stream; by inspecting
     *  the given object.
     *  @param {any} object - Object to be inspected.
     *  @param {util.InspectOptions} options - Inspect options.
     */
    dir(object, options) {
        if (!this.enabled)
            return;
        options = Object.assign({ customInspect: false }, (options || {}));
        const log = this.$getLogInfo('dir', _1.LogLevel.DEBUG, [`${util.inspect(object, options)}\n`]);
        this.$write(log);
    }
    /**
     *  Writes a `trace` log to the corresponding (debug) stream.
     *  @param {...any} args - Arguments to be logged.
     */
    trace(...args) {
        if (!this.enabled)
            return;
        // from Node source
        const err = new Error();
        err.name = '[TRACE]';
        err.message = util.format.apply(null, args);
        Error.captureStackTrace(err, this.trace);
        const log = this.$getLogInfo('trace', _1.LogLevel.DEBUG, [err.stack]);
        this.$write(log);
    }
    /**
     *  Prints a table from the given data to the corresponding (info level)
     *  stream.
     *  @param {any[]} data - Table data to be printed. Pass an array of arrays
     *  for rows and columns.
     *  @param {any} [options] - Table options.
     */
    table(data, options) {
        if (!this.enabled)
            return;
        const text = table_1.table(data, options);
        const log = this.$getLogInfo('table', _1.LogLevel.INFO, [text]);
        this.$write(log, false);
    }
    /**
     *  Writes a `silly` log to the corresponding stream.
     *  @param {...any} args - Arguments to be logged.
     */
    silly(...args) {
        if (!this.enabled)
            return;
        const log = this.$getLogInfo('silly', _1.LogLevel.SILLY, args);
        this.$write(log);
    }
    /**
     *  Writes the log with the given level to the corresponding stream.
     *  @param {Tilo.Level} level - Log level to be used.
     *  @param {...any} args - Arguments to be logged.
     *
     *  @example
     *  // outputs in warning level logs:
     *  tilo.log('warn', 'message...'); // —» message...
     */
    log(level, ...args) {
        if (!this.enabled)
            return;
        if (!this.isValidLevel(level)) {
            args.unshift(level);
            level = _1.LogLevel.INFO;
        }
        const log = this.$getLogInfo('log', level, args);
        this.$write(log);
    }
    /**
     *  Utility method to stringify the given argument(s) safely.
     *  This will automatically handle circular references, if any.
     *  @param {...any} args - Argument(s) to be stringified.
     *  @returns {string}
     *
     *  @example
     *  tilo.debug('Stringify:', tilo.s(obj));
     */
    s(...args) {
        return helper_1.helper.str(args);
    }
    /**
     *  Utility method to pretty-stringify the given argument(s) safely.
     *  This will automatically handle circular references, if any.
     *  @param {...any} args - Argument(s) to be stringified.
     *  @returns {string}
     *
     *  @example
     *  tilo.debug('Stringify pretty:', tilo.sp(obj));
     */
    sp(...args) {
        return helper_1.helper.str(args, true);
    }
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
    /* istanbul ignore next */
    emoji(name) {
        // below is actually tested but emoji is disabled in CI env.
        const s = name.trim().replace(/(^:|:$)/g, '');
        if (this.isInCI || !this.styles)
            return ':' + s + ':';
        return s ? emoji.get(`${s}`) : name;
    }
    /**
     *  Checks whether the given level is a valid Tilo log level.
     *  @param {string} level - Level name to be checked.
     *  @returns {boolean}
     */
    isValidLevel(level) {
        return Object.keys(_1.LogLevel).some((key) => _1.LogLevel[key] === level);
    }
    /**
     *  Plays system beep if the `info` level stream is TTY and called from a
     *  non-CI environment.
     */
    /* istanbul ignore next */
    beep() {
        // disabled in CI env.
        if (!this.enabled || this.isInCI)
            return;
        const stream = this.getStream(_1.LogLevel.INFO);
        /* istanbul ignore next */
        if (!stream || !('isTTY' in stream) || !stream.isTTY)
            return;
        /* istanbul ignore next */
        stream.write('\u0007');
    }
    /**
     *  Outputs an empty, new line without any meta or formatting.
     */
    newline() {
        if (!this.enabled)
            return;
        const stream = this.getStream(_1.LogLevel.INFO);
        /* istanbul ignore else */
        if (stream)
            stream.write('\n');
    }
    /**
     *  Gets a log information object for the given log argument(s).
     *  @protected
     *  @param {Tilo.Level} level - Level of the given log.
     *  @param {any[]} args - Log argument(s).
     *  @returns {ILogInfo}
     */
    $getLogInfo(method, level, args) {
        const d = new Date();
        const dateISO = d.toISOString();
        const date = dateISO.slice(0, 10);
        const time = dateISO.slice(11, 19);
        // check if any arg looks like stack trace string, update if so. we
        // won't do this for trace/debug logs.
        if (method !== 'trace' && this.$.cleanStack) {
            args = args.map((arg) => helper_1.helper.restack(arg, this.$.cleanStack));
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
     *  @protected
     *  @param {ILogInfo} logInfo - Log message, arguments and other metadata.
     *  @param {boolean} [useFormatter=true] - Whether to use the formatter.
     */
    $write(logInfo, useFormatter = true) {
        var _a;
        const { levelEnabled, stream } = logInfo;
        if (levelEnabled && stream) {
            // we'll pass logInfo to formatter and emitter...
            // format the output / or not...
            const log = useFormatter
                ? this.format
                    ? this.format(logInfo, this.chalk)
                    : helper_1.helper.identityFormat(logInfo)
                : (_a = logInfo.text, (_a !== null && _a !== void 0 ? _a : ''));
            // write the log to corresponding stream of the log level
            stream.write(log);
        }
        // if (this.listenerCount(LogEvent.LOG) <= 0) return;
        /**
         *  Fired when a log is attempted via its corresponding method. The log
         *  might not be actually written to the stream, if the corresponding
         *  log level is not enabled. To check this; you can use
         *  `logInfo.levelEnabled`.
         *  @event Tilo#log
         *  @type {ILogInfo}
         *
         *  @example
         *  const tilo = new Tilo();
         *  tilo.on('log', logInfo => {
         *      if (logInfo.level === Tilo.Level.ERROR && /\bfatal/i.test(logInfo.text)) {
         *          // e.g. send email to admin
         *      }
         *  });
         */
        this.emit(_1.LogEvent.LOG, logInfo);
    }
}
exports.Tilo = Tilo;
// -------------------------------
// EXPORT
// -------------------------------
/* istanbul ignore next */
(function (Tilo) {
    // https://github.com/Microsoft/TypeScript/issues/3832#issuecomment-121024254
    Tilo.Level = _1.LogLevel;
    Tilo.Priority = _1.LogPriority;
    Tilo.Event = _1.LogEvent;
})(Tilo || (Tilo = {}));
exports.Tilo = Tilo;
