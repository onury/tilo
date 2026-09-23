/**
 *  Enumerates the events emitted by a {@link Tilo} instance.
 */
enum LogEvent {
  /**
   *  Emitted whenever a log is attempted via one of the logging methods.
   *  Listeners receive the corresponding {@link ILogInfo} object. The event
   *  also fires for logs below the active level, which are not written to the
   *  stream; inspect `logInfo.levelEnabled` to tell. It does **not** fire
   *  while logging is disabled (`enabled = false`).
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
