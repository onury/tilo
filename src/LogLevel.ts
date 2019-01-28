/**
 *  Enumerates logging levels, prioritized from highest (`error`) to lowest (`silly`).
 *  @enum {string}
 *  @name Tilo.Level
 */
enum LogLevel {
    /**
     *  Indicates `"error"` logging level. This level should output error logs
     *  only. Priority: `0` (highest)
     *  @type {string}
     *  @name Tilo.Level.ERROR
     *  @default "error"
     */
    ERROR = 'error',
    /**
     *  Indicates `"warn"` logging level. This level should output error and
     *  warn logs only. Priority: `1`
     *  @type {string}
     *  @name Tilo.Level.WARN
     *  @default "warn"
     */
    WARN = 'warn',
    /**
     *  Indicates `"info"` logging level. This level should output error, warn and
     *  info logs only. Priority: `2`
     *  @type {string}
     *  @name Tilo.Level.INFO
     *  @default "info"
     */
    INFO = 'info',
    /**
     *  Indicates `"verbose"` logging level. This level should output error,
     *  warn, info and verbose logs. Priority: `3`
     *  @type {string}
     *  @name Tilo.Level.VERBOSE
     *  @default "verbose"
     */
    VERBOSE = 'verbose',
    /**
     *  Indicates `"debug"` logging level. This level should output error,
     *  warn, info, verbose and debug logs. Priority: `4`
     *  @type {string}
     *  @name Tilo.Level.DEBUG
     *  @default "debug"
     */
    DEBUG = 'debug',
    /**
     *  Indicates `"silly"` logging level. This level should output logs from
     *  all levels. Priority: `5` (lowest)
     *  @type {string}
     *  @name Tilo.Level.SILLY
     *  @default "silly"
     */
    SILLY = 'silly'
}

// Using a string enumeration rather than numeric bec. this is more
// user-friendly. But still we'll keep a priority list for internal operations.
// See `LogPriority`.

export { LogLevel };
