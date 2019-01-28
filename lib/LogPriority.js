"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *  Enumerates logging level priorities, highest (`0`) to lowest (`5`). This is
 *  for convenience. You'd typically make use of `Tilo.Level` enumeration
 *  instead.
 *  @enum {number}
 *  @name Tilo.Priority
 */
var LogPriority;
(function (LogPriority) {
    /**
     *  Indicates the level priority of `"error"` logs: `0`
     *  @type {number}
     *  @name Tilo.Priority.ERROR
     *  @default 0
     */
    LogPriority[LogPriority["ERROR"] = 0] = "ERROR";
    /**
     *  Indicates the level priority of `"warn"` logs: `1`
     *  @type {number}
     *  @name Tilo.Priority.WARN
     *  @default 1
     */
    LogPriority[LogPriority["WARN"] = 1] = "WARN";
    /**
     *  Indicates the level priority of `"info"` logs: `2`
     *  @type {number}
     *  @name Tilo.Priority.INFO
     *  @default 2
     */
    LogPriority[LogPriority["INFO"] = 2] = "INFO";
    /**
     *  Indicates the level priority of `"verbose"` logs: `3`
     *  @type {number}
     *  @name Tilo.Priority.VERBOSE
     *  @default 3
     */
    LogPriority[LogPriority["VERBOSE"] = 3] = "VERBOSE";
    /**
     *  Indicates the level priority of `"debug"` logs: `4`
     *  @type {number}
     *  @name Tilo.Priority.DEBUG
     *  @default 4
     */
    LogPriority[LogPriority["DEBUG"] = 4] = "DEBUG";
    /**
     *  Indicates the level priority of `"silly"` logs: `5`
     *  @type {number}
     *  @name Tilo.Priority.SILLY
     *  @default 5
     */
    LogPriority[LogPriority["SILLY"] = 5] = "SILLY";
})(LogPriority || (LogPriority = {}));
exports.LogPriority = LogPriority;
