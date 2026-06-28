/**
 *  Enumerates the logging level priorities, from highest (`0`) to lowest
 *  (`5`). This is provided for convenience; you would typically use the
 *  {@link LogLevel} enumeration instead.
 */
enum LogPriority {
  /**
   *  Priority of `"error"` logs: `0` (highest).
   */
  ERROR = 0,
  /**
   *  Priority of `"warn"` logs: `1`.
   */
  WARN = 1,
  /**
   *  Priority of `"info"` logs: `2`.
   */
  INFO = 2,
  /**
   *  Priority of `"verbose"` logs: `3`.
   */
  VERBOSE = 3,
  /**
   *  Priority of `"debug"` logs: `4`.
   */
  DEBUG = 4,
  /**
   *  Priority of `"silly"` logs: `5` (lowest).
   */
  SILLY = 5
}

export { LogPriority };
