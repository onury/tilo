import type { LogLevel, LogPriority } from './index.js';

/**
 *  Describes a single log: its level, metadata and normalized output. This is
 *  the object passed to a {@link LogFormatFn} and emitted with the
 *  {@link LogEvent.LOG} event.
 */
interface ILogInfo {
  /**
   *  Log level of the corresponding log.
   */
  level: LogLevel;
  /**
   *  Priority of the log level.
   */
  priority: LogPriority;
  /**
   *  Whether the corresponding log level is enabled at the time of logging,
   *  i.e. whether this log is actually written to the stream.
   */
  levelEnabled: boolean;
  /**
   *  Writable stream of the corresponding log level.
   */
  stream: NodeJS.WritableStream;
  /**
   *  UTC timestamp (in milliseconds) for the corresponding log.
   */
  timestamp: number;
  /**
   *  ISO date (string in `YYYY-MM-DD` format) indicating the log date.
   */
  date: string;
  /**
   *  ISO time (string in `HH:mm:ss` format) indicating the log time.
   */
  time: string;
  /**
   *  Normalized log output as string.
   */
  text: string;
  /**
   *  Unformatted argument(s) of the log.
   */
  args: any[];
  /**
   *  Name of the method used to output the log. For example, the `trace`
   *  method outputs `debug` level logs.
   */
  method: string;
}

export type { ILogInfo };
