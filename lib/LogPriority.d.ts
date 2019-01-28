/**
 *  Enumerates logging level priorities, highest (`0`) to lowest (`5`). This is
 *  for convenience. You'd typically make use of `Tilo.Level` enumeration
 *  instead.
 *  @enum {number}
 *  @name Tilo.Priority
 */
declare enum LogPriority {
    /**
     *  Indicates the level priority of `"error"` logs: `0`
     *  @type {number}
     *  @name Tilo.Priority.ERROR
     *  @default 0
     */
    ERROR = 0,
    /**
     *  Indicates the level priority of `"warn"` logs: `1`
     *  @type {number}
     *  @name Tilo.Priority.WARN
     *  @default 1
     */
    WARN = 1,
    /**
     *  Indicates the level priority of `"info"` logs: `2`
     *  @type {number}
     *  @name Tilo.Priority.INFO
     *  @default 2
     */
    INFO = 2,
    /**
     *  Indicates the level priority of `"verbose"` logs: `3`
     *  @type {number}
     *  @name Tilo.Priority.VERBOSE
     *  @default 3
     */
    VERBOSE = 3,
    /**
     *  Indicates the level priority of `"debug"` logs: `4`
     *  @type {number}
     *  @name Tilo.Priority.DEBUG
     *  @default 4
     */
    DEBUG = 4,
    /**
     *  Indicates the level priority of `"silly"` logs: `5`
     *  @type {number}
     *  @name Tilo.Priority.SILLY
     *  @default 5
     */
    SILLY = 5
}
export { LogPriority };
