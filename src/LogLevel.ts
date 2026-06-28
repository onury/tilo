/**
 *  Enumerates the logging levels, prioritized from highest (`error`) to
 *  lowest (`silly`). The {@link Tilo} instance only outputs logs at or above
 *  its configured level. See {@link LogPriority} for the numeric priorities.
 */
enum LogLevel {
  /**
   *  The `"error"` logging level. Outputs error logs only. Priority: `0`
   *  (highest).
   */
  ERROR = 'error',
  /**
   *  The `"warn"` logging level. Outputs error and warn logs. Priority: `1`.
   */
  WARN = 'warn',
  /**
   *  The `"info"` logging level. Outputs error, warn and info logs.
   *  Priority: `2`.
   */
  INFO = 'info',
  /**
   *  The `"verbose"` logging level. Outputs error, warn, info and verbose
   *  logs. Priority: `3`.
   */
  VERBOSE = 'verbose',
  /**
   *  The `"debug"` logging level. Outputs error, warn, info, verbose and
   *  debug logs. Priority: `4`.
   */
  DEBUG = 'debug',
  /**
   *  The `"silly"` logging level. Outputs logs from all levels. Priority: `5`
   *  (lowest).
   */
  SILLY = 'silly'
}

// Using a string enumeration rather than numeric bec. this is more
// user-friendly. But still we'll keep a priority list for internal operations.
// See `LogPriority`.

export { LogLevel };
