import type { ILogLevelStreams, LogFormatFn, LogLevel } from './index.js';

/**
 *  Options for configuring a {@link Tilo} instance.
 */
interface ILogOptions {
  /**
   *  Whether logs are enabled. Default: `true`
   */
  enabled?: boolean;
  /**
   *  Log level to be set for the logger. Default: {@link LogLevel.DEBUG}
   */
  level?: LogLevel;
  /**
   *  The formatter function for styling and coloring the log output. If not
   *  set, the default formatter function will be used.
   */
  format?: LogFormatFn;
  /**
   *  Whether styles and colors are enabled. Useful if you do not want to
   *  change the formatter function but still disable styles. Default: `true`
   */
  styles?: boolean;
  /**
   *  A hash-map of objects that defines write streams for each individual log
   *  level. If a single stream is set, it will be used as default for each
   *  log level.
   */
  streams?: ILogLevelStreams | NodeJS.WritableStream;
  /**
   *  If set to `true`, stack lines with no file-path in them will be removed.
   *
   *  You can also pass a list of case-sensitive keywords to be ignored within
   *  the error stacks. Stack lines with any of these keywords in them will be
   *  filtered out. Default: `false`
   */
  cleanStack?: boolean | string[];
}

export type { ILogOptions };
