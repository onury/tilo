/// <reference types="node" />
/**
 *  Interface for streams for each individual log level.
 */
interface ILogLevelStreams {
    /**
     *  If this is set, this stream will be used as default for any log level
     *  that does not have a stream defined.
     *  @type {NodeJS.WritableStream}
     */
    default?: NodeJS.WritableStream;
    /**
     *  Stream for `error` level logs to be written to.
     *  @type {NodeJS.WritableStream}
     */
    error?: NodeJS.WritableStream;
    /**
     *  Stream for `warn` level logs to be written to.
     *  @type {NodeJS.WritableStream}
     */
    warn?: NodeJS.WritableStream;
    /**
     *  Stream for `info` level logs to be written to.
     *  @type {NodeJS.WritableStream}
     */
    info?: NodeJS.WritableStream;
    /**
     *  Stream for `verbose` level logs to be written to.
     *  @type {NodeJS.WritableStream}
     */
    verbose?: NodeJS.WritableStream;
    /**
     *  Stream for `debug` level logs to be written to.
     *  @type {NodeJS.WritableStream}
     */
    debug?: NodeJS.WritableStream;
    /**
     *  Stream for `silly` level logs to be written to.
     *  @type {NodeJS.WritableStream}
     */
    silly?: NodeJS.WritableStream;
}
export { ILogLevelStreams };
