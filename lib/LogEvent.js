"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *  Enumerates logging levels, prioritized from highest to lowest.
 *  @enum {string}
 *  @name Tilo.Event
 */
var LogEvent;
(function (LogEvent) {
    /**
     *  Indicates that some output is written to a log level.
     *  Any event handler will be invoked with `ILogInfo` object.
     *  @type {string}
     *  @name Tilo.Event.LOG
     *  @default "log"
     */
    LogEvent["LOG"] = "log";
})(LogEvent || (LogEvent = {}));
exports.LogEvent = LogEvent;
