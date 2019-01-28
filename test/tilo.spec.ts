// core modules
import * as fs from 'fs';

// dep modules
import { Chalk } from 'chalk';
import * as rimraf from 'rimraf';

// own modules
import {
    ILogInfo, ILogOptions, LogLevel, LogPriority, Tilo
} from '../src';

/**
 *  Test Suite: Tilo
 */
describe('Tilo', () => {

    afterAll(done => {
        rimraf('./test/tmp/*', done);
    });

    test('options, getters', () => {
        let tilo = new Tilo();
        // defaults
        expect(tilo.level).toEqual(Tilo.Level.DEBUG);
        expect(tilo.enabled).toEqual(true);
        expect(tilo.streams.default).toEqual(process.stdout);
        expect(tilo.streams.error).toBeUndefined();
        expect(tilo.format).toEqual(Tilo.defaultFormat);
        expect(tilo.cleanStack).toEqual(false);
        expect(tilo.isInCI).toEqual(expect.any(Boolean));

        tilo = new Tilo({
            enabled: false,
            level: Tilo.Level.WARN,
            streams: {
                default: process.stdout,
                error: process.stderr
            }
        });
        expect(tilo.level).toEqual(Tilo.Level.WARN);
        expect(tilo.priority).toEqual(LogPriority.WARN);
        expect(tilo.enabled).toEqual(false);
        expect(tilo.styles).toEqual(true);
        expect(tilo.streams.default).toEqual(process.stdout);
        expect(tilo.streams.error).toEqual(process.stderr);
        expect(tilo.streams.warn).toBeUndefined();
        expect(tilo.streams.info).toBeUndefined();
        expect(tilo.streams.verbose).toBeUndefined();
        expect(tilo.streams.debug).toBeUndefined();
        expect(tilo.streams.silly).toBeUndefined();

        tilo.format = null;
        expect(tilo.format).toEqual(null);

        tilo = new Tilo({
            streams: process.stderr
        });
        expect(tilo.streams.default).toEqual(process.stderr);

        expect(() => {
            const a = new Tilo({
                streams: {
                    error: process.stderr
                }
            });
        }).toThrow('No default stream');
    });

    test('#error()', getLogTest('error'));
    test('#error() » enabled = false', getLogTest('error', { enabled: false }));
    test('#warn()', getLogTest('warn'));
    test('#warn() » enabled = false', getLogTest('warn', { enabled: false }));
    test('#info()', getLogTest('info'));
    test('#verbose()', getLogTest('verbose'));
    test('#verbose() » enabled = false', getLogTest('verbose', { enabled: false }));
    test('#debug()', getLogTest('debug'));
    test('#debug() » enabled = false', getLogTest('debug', { enabled: false }));
    test('#silly()', getLogTest('silly', { styles: true, level: LogLevel.SILLY }));
    test('#silly() » enabled = false', getLogTest('silly', { enabled: false, level: LogLevel.SILLY }));
    test('#info() » enabled = false', getLogTest('info', { enabled: false }));
    test('warn > error', getLogTest('warn', { level: LogLevel.ERROR }));
    test('info > warn', getLogTest('info', { level: LogLevel.WARN }));
    test('verbose > info', getLogTest('verbose', { level: LogLevel.INFO }));
    test('debug > verbose', getLogTest('debug', { level: LogLevel.VERBOSE }));
    test('silly > debug', getLogTest('silly', { level: LogLevel.DEBUG }));
    test('#ok()', getLogTest('ok'));
    test('#ok() » enabled = false', getLogTest('ok', { enabled: false }));

    test('#format', done => {
        const stream = getStream((text: string) => {
            expect(hasStyles(text)).toEqual(true);
            expect(removeStyles(text)).toMatch(/^ ••• /);
            done();
        });
        const tilo = new Tilo({
            streams: stream,
            format: (info: ILogInfo, chalk: Chalk) => {
                return chalk.white(' ••• ') + Tilo.defaultFormat(info, chalk);
            }
        });
        tilo.info('test');
    });

    test('#format = null', done => {
        const stream = getStream((text: string) => {
            expect(hasStyles(text)).toEqual(false);
            expect(text).toEqual('test');
            done();
        });
        const tilo = new Tilo({
            streams: stream,
            styles: true,
            format: null
        });
        tilo.info('test');
    });

    test('cleanStack = false', done => {
        const stream = getStream((text: string) => {
            expect(hasStyles(text)).toEqual(false);
            // expect(/[ (]<anonymous>([\r\n]|$)/.test(text)).toEqual(true);
            expect(/(jasmine|jest)/.test(text)).toEqual(true);
            done();
        });
        const options: ILogOptions = {
            streams: stream,
            styles: false,
            cleanStack: false
        };
        const tilo = new Tilo(options);
        tilo.error(new Error('test').stack);
    });

    test('cleanStack = string[]', done => {
        const stream = getStream((text: string) => {
            expect(hasStyles(text)).toEqual(false);
            expect(/[ (]<anonymous>([\r\n]|$)/.test(text)).toEqual(false);
            expect(/(jasmine|jest)/.test(text)).toEqual(false);
            done();
        });
        const options: ILogOptions = {
            streams: stream,
            styles: false,
            cleanStack: ['jasmine', 'jest']
        };
        const tilo = new Tilo(options);
        tilo.error(new Error('test').stack);
    });

    test('#plain()', done => {
        const plainLog = 'plain-log';
        const stream = getStream((text: string) => {
            expect(hasStyles(text)).toEqual(false);
            expect(text.indexOf(plainLog) >= 0).toEqual(true);
            done();
        });
        const tilo = new Tilo({
            streams: stream,
            styles: true
        });
        tilo.plain(plainLog);
    });
    test('#plain() » enabled = false', getLogTest('plain', { enabled: false }));
    test('info (log) > warn', getLogTest('log', { level: LogLevel.WARN }));

    test('#log() - valid level', done => {
        const stream = getStream((text: string) => {
            expect(hasStyles(text)).toEqual(false);
            expect(text.indexOf(' VERBO  test log') >= 0).toEqual(true);
            done();
        });
        const tilo = new Tilo({
            streams: stream,
            styles: false
        });
        tilo.log(LogLevel.VERBOSE, 'test', 'log');
    });

    test('#log() - invalid level', done => {
        const stream = getStream((text: string) => {
            expect(hasStyles(text)).toEqual(false);
            expect(/ INFO[ ]+MYLEVEL/.test(text)).toEqual(true);
            done();
        });
        const tilo = new Tilo({
            streams: stream,
            styles: false
        });
        tilo.log('MYLEVEL' as LogLevel);
    });
    test('#log() » enabled = false', getLogTest('log', { enabled: false }));

    test('#dir()', done => {
        const stream = getStream((text: string) => {
            expect(hasStyles(text)).toEqual(true);
            expect(removeStyles(text).indexOf('{ x: 1 }') >= 0).toEqual(true);
            done();
        });
        const tilo = new Tilo({
            streams: stream
        });
        tilo.dir({ x: 1 });
    });
    test('#dir() » enabled = false', getLogTest('dir', { enabled: false }));

    test('#trace()', done => {
        const stream = getStream((text: string) => {
            expect(hasStyles(text)).toEqual(true);
            const clean = removeStyles(text);
            expect(clean.indexOf('[TRACE]: test') >= 0).toEqual(true);
            expect(clean.indexOf('\n    at') >= 0).toEqual(true);
            expect(clean.indexOf('tilo.spec.ts:') >= 0).toEqual(true);
            done();
        });
        const tilo = new Tilo({
            streams: stream
        });
        tilo.trace('test');
    });
    test('#trace() » enabled = false', getLogTest('trace', { enabled: false }));

    test('#s(), #sp()', done => {
        const sLog = '{"x":1}';
        const spLog = '{\n  "y": 2\n}';
        const stream = getStream((text: string) => {
            expect(hasStyles(text)).toEqual(false);
            expect(text.indexOf(sLog) >= 0).toEqual(true);
            expect(text.indexOf(spLog) >= 0).toEqual(true);
            done();
        });
        const tilo = new Tilo({
            streams: stream,
            styles: false
        });
        expect(tilo.styles).toEqual(false);
        const circular: any = {};
        circular.x = circular;
        tilo.info(tilo.s({ x: 1 }), tilo.sp({ y: 2 }), tilo.sp(circular));
    });

    test('#newline()', done => {
        const stream = getStream((text: string) => {
            expect(hasStyles(text)).toEqual(false);
            expect(text.indexOf('\n') >= 0).toEqual(true);
            done();
        });
        const tilo = new Tilo({
            streams: stream
        });
        tilo.newline();
    });

    test('#newline() » enabled = false', done => {
        const stream = getStream((text: string) => {
            expect(text).toBeUndefined();
            done();
        });
        const tilo = new Tilo({
            enabled: false,
            streams: stream
        });
        tilo.newline();
    });

    test('#beep()', done => {
        const stream = getStream((text: string) => {
            expect(hasStyles(text)).toEqual(false);
            expect(text).toBeUndefined();
            done();
        });
        const tilo = new Tilo({
            streams: stream
        });
        tilo.beep();
    });

    test('#beep() » enabled = false', done => {
        const stream = getStream((text: string) => {
            expect(text).toBeUndefined();
            done();
        });
        const tilo = new Tilo({
            enabled: false,
            streams: stream
        });
        tilo.beep();
    });

    test('#emoji()', done => {
        let tilo: Tilo;
        const stream = getStream((text: string) => {
            // emoji is not parsed in CI env.
            expect(/\:?punch\:?/.test(text)).toEqual(tilo.isInCI);
            expect(text.indexOf('👊') >= 0).toEqual(!tilo.isInCI);
            done();
        });
        tilo = new Tilo({
            streams: stream,
            styles: true
        });
        tilo.plain(tilo.emoji('punch'));
    });

    test('#emoji() » styles = false', done => {
        const stream = getStream((text: string) => {
            expect(text.indexOf(':punch:') >= 0).toEqual(true);
            expect(text.indexOf('👊') >= 0).toEqual(false);
            done();
        });
        const tilo = new Tilo({
            streams: stream,
            styles: false
        });
        tilo.plain(tilo.emoji('punch'));
    });

    test('#emoji() » (unknown name)', done => {
        const stream = getStream((text: string) => {
            expect(text.indexOf('unknown_emoji') >= 0).toEqual(true);
            done();
        });
        const tilo = new Tilo({
            streams: stream,
            styles: true
        });
        tilo.plain(tilo.emoji('unknown_emoji'));
    });

    test('#table()', done => {
        const stream = getStream((text: string) => {
            expect(removeStyles(text).indexOf(tableOut) >= 0).toEqual(true);
            done();
        });
        const tilo = new Tilo({
            streams: stream,
            styles: false // !!!
        });
        const c = tilo.chalk.white.bold;
        const data = [
            [c('#'), c('Name'), c('Email')],
            [1, 'Bob Loo', 'bob@loo.com'],
            [2, 'John Doe', 'john@doe.com']
        ];
        tilo.table(data);
    });
    test('#table() » enabled = false', getLogTest('table', { enabled: false }));

});

const tableOut =
`╔═══╤══════════╤══════════════╗
║ # │ Name     │ Email        ║
╟───┼──────────┼──────────────╢
║ 1 │ Bob Loo  │ bob@loo.com  ║
╟───┼──────────┼──────────────╢
║ 2 │ John Doe │ john@doe.com ║
╚═══╧══════════╧══════════════╝`;

// ----------------------
// HELPERS
// ----------------------

const methodLevels = {
    error: LogLevel.ERROR,
    warn: LogLevel.WARN,
    info: LogLevel.INFO,
    verbose: LogLevel.VERBOSE,
    debug: LogLevel.DEBUG,
    silly: LogLevel.SILLY,
    trace: LogLevel.DEBUG,
    dir: LogLevel.DEBUG,
    table: LogLevel.INFO,
    plain: LogLevel.INFO,
    log: LogLevel.INFO, // default, can be changed by the method
    ok: LogLevel.INFO
};

function hasStyles(text: string): boolean {
    return /\u001b/.test(text) && /\[\d\dm/.test(text);
}

function removeStyles(text: string): string {
    return text.replace(/\u001b/g, '')
        .replace(/\[\d\dm/g, '');
}

// e.g. \u001b[36mXX\u001b[39m will not show as string, XX will be colorized
// this removes \u001b (escape char \) and [ so they're visible as text in
// jasmine logs, when an expectation fails.
// Also removing \n at the end for readibility.
// function esc(str: string): string {
//     return str.replace(/\u001b\[/g, '[').replace(/\n$/g, '');
// }

function checkLogInfo(info: ILogInfo, method: string, log: string): void {
    expect(info.method).toEqual(method);
    expect(info.level).toEqual(methodLevels[method]);
    expect(new Date(info.timestamp).toISOString().replace(/\.\d{3}Z$/, ''))
        .toEqual(info.date + 'T' + info.time);
    expect(info.text).toEqual(log);
    expect(info.args.join(' ')).toEqual(log);
}

function getLogTest(method: string, options?: ILogOptions): (done: jest.DoneCallback) => void {
    return (done: jest.DoneCallback) => {
        const log = 'test log...';
        let tilo: Tilo;
        const level = methodLevels[method];
        const priority = Tilo.getPriorityOf(level);

        const stream = getStream((text: string) => {
            if (!tilo.enabled || tilo.priority < priority) {
                expect(Boolean(text)).toEqual(false);
                done();
                return;
            }
            // e.g.: 2018-11-23 19:22:30  ERROR  test log...
            // with styles: \u001b[90m2018-11-23 22:59:48\u001b[39m  \u001b[31mERROR\u001b[39m  \u001b[31mtest error...\u001b[39m
            expect(hasStyles(text)).toEqual(tilo.styles);
            const clean = removeStyles(text);
            // check date/time
            expect(/^\s*\d{4}\-\d{2}\-\d{2}\s+/.test(clean)).toEqual(true);
            // expect(clean).toMatch(` ${method.toUpperCase()} `);
            expect(text).toMatch(log);
            done();
        });
        tilo = new Tilo({
            streams: stream,
            styles: false,
            ...(options || {})
        });
        tilo.on('log', (info: ILogInfo) => {
            // this should not execute if tilo is disabled.
            checkLogInfo(info, method, log);
        });
        tilo[method](log);
    };
}

let num = 0;
function getStream(cb: (text: string) => void): NodeJS.WritableStream {

    num++;
    const file = `./test/tmp/log-${num}.txt`; // '/dev/null';
    const writable = fs.createWriteStream(file);
    let readable;

    function onWritableReady(): void {

        let text = '';

        readable = fs.createReadStream(file);
        readable.setEncoding('utf8');

        function onReadbleEnd(): void {
            readable.removeAllListeners();
            readable.close();
            writable.removeAllListeners();
            writable.close();

            // console.log(`should log: "${text || undefined}"`);
            // cb(text);
            setTimeout(() => cb(text || undefined), 20);
        }

        readable.on('readable', () => {
            let buffer: Buffer;
            // tslint:disable-next-line:no-conditional-assignment binary-expression-operand-order
            while (null !== (buffer = readable.read())) {
                text += buffer.toString();
            }
        });

        readable.on('end', onReadbleEnd);
    }

    // 'ready' event is introduced in Node.js v9.11.0 so we use 'open' event.
    writable.on('open', () => {
        setTimeout(onWritableReady, 50);
    });

    return writable;
}
