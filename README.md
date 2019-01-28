
# tilo

[![CI Build Status](https://img.shields.io/travis/onury/tilo.svg?branch=master&style=flat-square)](https://travis-ci.org/onury/tilo)
[![Coverage Status](https://img.shields.io/coveralls/github/onury/tilo/master.svg?style=flat-square)](https://coveralls.io/github/onury/tilo?branch=master)
[![npm](http://img.shields.io/npm/v/tilo.svg?style=flat-square)](https://www.npmjs.com/package/tilo)
[![release](https://img.shields.io/github/release/onury/tilo.svg?style=flat-square)](https://github.com/onury/tilo)
[![dependencies](https://david-dm.org/onury/tilo.svg?style=flat-square)](https://david-dm.org/onury/tilo)
[![license](http://img.shields.io/npm/l/tilo.svg?style=flat-square)](https://github.com/onury/tilo/blob/master/LICENSE)
[![maintained](https://img.shields.io/maintenance/yes/2019.svg?style=flat-square)](https://github.com/onury/tilo/graphs/commit-activity)
[![TypeScript](https://img.shields.io/badge/written%20in-%20TypeScript%20-6575ff.svg?style=flat-square)](https://www.typescriptlang.org)

> © 2019, Onur Yıldırım ([@onury](https://github.com/onury)). MIT License.

Tiny logger with styles and levels for Node/TypeScript.

`npm i tilo`

## Usage

```js
// Node/CommonJS environments
const { Tilo } = require('tilo');

// With modern ES / transpilers
import { Tilo } from 'tilo';

// Usage:
const tilo = new Tilo({ level: 'debug' });
tilo.info('Output colorful logs with date/time and level info.');
```

### Formatted Output

You can provide a custom function that returns a formatted string.
```js
tilo.format = (info, chalk) => {
    const text = `${info.time} ${info.level.toUpperCase()}\t${info.text}`;
    return info.level === Tilo.Level.ERROR
        ? chalk.red(text)
        : chalk.white(text);
};
tilo.info('Custom formatted log...');
// —> 15:30:43 INFO   Custom formatted log...
```

### Safely Stringified Logs

You can log safely strigified objects (i.e. with circular references).  
Use `#s()` to stringify an individual or multiple values.  
`#sp()` is for stringify with pretty format & indents.
```js
tilo.info(tilo.s({ key: 'stringify' }));
tilo.warn(tilo.sp({ key: 'stringify pretty' }));
```

### Configuration

Pass an `options` object to constructor, with the following properties:<br />

<table>
    <thead>
        <tr>
            <th>Option</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code><b>enabled</b></code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>Whether log output is enabled.</td>
        </tr>
        <tr>
            <td><code><b>level</b></code></td>
            <td><code>string</code></td>
            <td><code>"debug"</code></td>
            <td>Logging level. You can use <code>Tilo.Level</code> enumeration.</td>
        </tr>
        <tr>
            <td><code><b>format</b></code></td>
            <td><code>LogFormatFn</code></td>
            <td><code>Tilo.defaultFormat</code></td>
            <td>
                Function for formatting and styling. Set to <code>null</code> to disable formatting.
            </td>
        </tr>
        <tr>
            <td><code><b>styles</b></code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>
                Specifies whether styles and colors are enabled. 
            </td>
        </tr>
        <tr>
            <td><code><b>streams</b></code></td>
            <td><code>ILogLevelStreams | NodeJS.WriteStream</code></td>
            <td><code>process.stdout</code></td>
            <td>
                A hash-map of objects that defines write streams for each individual log level. If set to a single stream, it's treated as default for each log level.
            </td>
        </tr>
        <tr>
            <td><code><b>cleanStack</b></code></td>
            <td><code>boolean | string[]</code></td>
            <td><code>false</code></td>
            <td>
                If set to <code>true</code>, stack lines with no file-path in them will be removed. Or set to a list of case-sensitive keywords to be filtered out from the stacks.
            </td>
        </tr>
    </tbody>
</table>

### Log Levels and Methods

<table>
    <thead>
        <tr>
            <th colspan="2">Level&nbsp;/&nbsp;Priority</th>
            <th>Methods</th>
            <th>Details</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code><b>ERROR</b></code></td>
            <td><code>0</code></td>
            <td><code>#error()</code></td>
            <td>Error logs. Always printed to the stream.</td>
        </tr>
        <tr>
            <td><code><b>WARN</b></code></td>
            <td><code>1</code></td>
            <td><code>#warn()</code></td>
            <td>Warning logs.</td>
        </tr>
        <tr>
            <td rowspan="3"><code><b>INFO</b></code></td>
            <td rowspan="3"><code>2</code></td>
            <td><code>#info()</code></td>
            <td>Informational logs. Alias: <code>#ok()</code></td>
        </tr>
        <tr>
            <td><code>#plain()</code></td>
            <td>Regardless the configuration, output has no formatting. Clean text.</td>
        </tr>
        <tr>
            <td><code>#table()</code></td>
            <td>Prints a visual table to the stream with the given data.</td>
        </tr>
        <tr>
            <td><code><b>VERBOSE</b></code></td>
            <td><code>3</code></td>
            <td><code>#verbose()</code></td>
            <td>Verbose logs.</td>
        </tr>
        <tr>
            <td rowspan="3"><code><b>DEBUG</b></code></td>
            <td rowspan="3"><code>4</code></td>
            <td><code>#debug()</code></td>
            <td>Debug logs.</td>
        </tr>
        <tr>
            <td><code>#dir()</code></td>
            <td>Inspects the given object and prints the result to the stream.</td>
        </tr>
        <tr>
            <td><code>#trace()</code></td>
            <td>Prints the message to the stream with stack trace to the current position in code.</td>
        </tr>
        <tr>
            <td><code><b>SILLY</b></code></td>
            <td><code>5</code></td>
            <td><code>#silly()</code></td>
            <td>Silly logs.</td>
        </tr>
    </tbody>
</table>

There is also a `#log()` method which is `INFO` level by default. But you can pass the log level as the first argument to change that:
```js
tilo.log('debug', 'message...');
```

### Log Event

Tilo is also an `EventEmitter`. You can run custom functionallity on the `log` event.
```js
tilo.on('log', logInfo => {
    if (logInfo.level === 'error' && /\bfatal/i.test(logInfo.text)) {
        // e.g. send email to admin
    }
});
```

## Changelog

**v1.0.0** (2019-01-28)
- initial release.

## License

MIT.
