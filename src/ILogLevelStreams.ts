/**
 *  Maps each individual log level to the writable stream it is written to.
 */
interface ILogLevelStreams {
  /**
   *  If set, this stream is used as default for any log level that does not
   *  have a stream defined.
   */
  default?: NodeJS.WritableStream;
  /**
   *  Stream for `error` level logs to be written to.
   */
  error?: NodeJS.WritableStream;
  /**
   *  Stream for `warn` level logs to be written to.
   */
  warn?: NodeJS.WritableStream;
  /**
   *  Stream for `info` level logs to be written to.
   */
  info?: NodeJS.WritableStream;
  /**
   *  Stream for `verbose` level logs to be written to.
   */
  verbose?: NodeJS.WritableStream;
  /**
   *  Stream for `debug` level logs to be written to.
   */
  debug?: NodeJS.WritableStream;
  /**
   *  Stream for `silly` level logs to be written to.
   */
  silly?: NodeJS.WritableStream;
}

export type { ILogLevelStreams };
