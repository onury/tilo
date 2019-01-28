/**
 *  Enumerates logging levels, prioritized from highest to lowest.
 *  @enum {string}
 *  @name Tilo.Event
 */
enum LogEvent {
    /**
     *  Indicates that some output is written to a log level.
     *  Any event handler will be invoked with `ILogInfo` object.
     *  @type {string}
     *  @name Tilo.Event.LOG
     *  @default "log"
     */
    LOG = 'log'
}

export { LogEvent };
