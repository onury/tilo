"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *  Enumerates logging levels, prioritized from highest (`error`) to lowest (`silly`).
 *  @enum {string}
 *  @name Tilo.Level
 */
var LogLevel;
(function (LogLevel) {
    /**
     *  Indicates `"error"` logging level. This level should output error logs
     *  only. Priority: `0` (highest)
     *  @type {string}
     *  @name Tilo.Level.ERROR
     *  @default "error"
     */
    LogLevel["ERROR"] = "error";
    /**
     *  Indicates `"warn"` logging level. This level should output error and
     *  warn logs only. Priority: `1`
     *  @type {string}
     *  @name Tilo.Level.WARN
     *  @default "warn"
     */
    LogLevel["WARN"] = "warn";
    /**
     *  Indicates `"info"` logging level. This level should output error, warn and
     *  info logs only. Priority: `2`
     *  @type {string}
     *  @name Tilo.Level.INFO
     *  @default "info"
     */
    LogLevel["INFO"] = "info";
    /**
     *  Indicates `"verbose"` logging level. This level should output error,
     *  warn, info and verbose logs. Priority: `3`
     *  @type {string}
     *  @name Tilo.Level.VERBOSE
     *  @default "verbose"
     */
    LogLevel["VERBOSE"] = "verbose";
    /**
     *  Indicates `"debug"` logging level. This level should output error,
     *  warn, info, verbose and debug logs. Priority: `4`
     *  @type {string}
     *  @name Tilo.Level.DEBUG
     *  @default "debug"
     */
    LogLevel["DEBUG"] = "debug";
    /**
     *  Indicates `"silly"` logging level. This level should output logs from
     *  all levels. Priority: `5` (lowest)
     *  @type {string}
     *  @name Tilo.Level.SILLY
     *  @default "silly"
     */
    LogLevel["SILLY"] = "silly";
})(LogLevel || (LogLevel = {}));
exports.LogLevel = LogLevel;
