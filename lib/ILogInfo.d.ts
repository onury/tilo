/// <reference types="node" />
import { LogLevel, LogPriority } from './';
/**
 *  Interface for log information.
 */
interface ILogInfo {
    /**
     *  Log level of the corresponding log.
     *  @type {Tilo.Level}
     */
    level: LogLevel;
    /**
     *  Priority of the log level.
     *  @type {Tilo.Priority}
     */
    priority: LogPriority;
    /**
     *  Specifies whether the corresponding log level is enabled at the time of
     *  logging and this log is output to the stream.
     *  @type {boolean}
     */
    levelEnabled: boolean;
    /**
     *  Writable stream of the corresponding log level.
     *  @type {NodeJS.WritableStream}
     */
    stream: NodeJS.WritableStream;
    /**
     *  UTC timestamp (in milliseconds) for the corresponding log.
     *  @type {number}
     */
    timestamp: number;
    /**
     *  ISO date (string in `YYYY-MM-DD` format) indicating the log date.
     *  @type {string}
     */
    date: string;
    /**
     *  ISO time (string in `HH:mm:ss` format) indicating the log time.
     *  @type {string}
     */
    time: string;
    /**
     *  Normalized log output as string.
     *  @type {string}
     */
    text: string;
    /**
     *  Unformatted argument(s) of the log.
     *  @type {any[]}
     */
    args: any[];
    /**
     *  Name of the method used to output the log.
     *  For example; `trace` method outputs `debug` level logs.
     *  @type {string}
     */
    method: string;
}
export { ILogInfo };
