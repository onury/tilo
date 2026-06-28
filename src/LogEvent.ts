/**
 *  Enumerates the events emitted by a {@link Tilo} instance.
 */
enum LogEvent {
  /**
   *  Emitted whenever a log is attempted via one of the logging methods.
   *  Listeners receive the corresponding {@link ILogInfo} object. Note that
   *  the log is emitted even when it is not written to the stream (e.g. when
   *  the log level is not enabled); inspect `logInfo.levelEnabled` to tell.
   *
   *  @example
   *  const tilo = new Tilo();
   *  tilo.on('log', logInfo => {
   *    if (logInfo.level === LogLevel.ERROR && /\bfatal/i.test(logInfo.text)) {
   *      // e.g. send email to admin
   *    }
   *  });
   */
  LOG = 'log'
}

export { LogEvent };
