# fis-http-push
[![npm version](https://img.shields.io/npm/v/fis-http-push.svg)](https://www.npmjs.org/package/fis-http-push)
[![downloads](https://img.shields.io/npm/dm/fis-http-push.svg)](https://www.npmjs.org/package/fis-http-push)
[![Build Status](https://travis-ci.com/searchfe/fis-http-push.svg?branch=master)](https://travis-ci.com/searchfe/fis-http-push)
[![Coveralls](https://img.shields.io/coveralls/searchfe/fis-http-push.svg)](https://coveralls.io/github/searchfe/fis-http-push?branch=master)
[![dependencies](https://img.shields.io/david/searchfe/fis-http-push.svg)](https://david-dm.org/searchfe/fis-http-push)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/searchfe/fis-http-push)
[![GitHub issues](https://img.shields.io/github/issues-closed/searchfe/fis-http-push.svg)](https://github.com/searchfe/fis-http-push/issues)
[![David](https://img.shields.io/david/searchfe/fis-http-push.svg)](https://david-dm.org/searchfe/fis-http-push)
[![David Dev](https://img.shields.io/david/dev/searchfe/fis-http-push.svg)](https://david-dm.org/searchfe/fis-http-push?type=dev)
[![DUB license](https://img.shields.io/dub/l/vibe-d.svg)](https://github.com/searchfe/fis-http-push/blob/master/LICENSE)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#commits)

FIS HTTP Push SDK, 用于 push 文件到 Fis Secure Receiver（新版的 fis http-push）。

## 编程接口

编程接口主要包括 `fcp`, `push`, `pushFile` 三个接口，都返回 `Promise<void>`。
其中 fcp 是高度封装的接口，支持单个文件、多个文件、文件夹：

```javascript
const {fcp} = require('fis-http-push');

// 单文件
fcp('./main.js', '/var/www/main.js', {receiver: 'http://example.com:8210'})
// 文件夹
fcp('./dist/', '/var/www/main.js', {receiver: 'http://example.com:8210', recursive: true})
```

`push` 和 `pushFile` 是细粒度的接口，用来完成文件到文件的任务。不支持文件夹，但可以为每个 SOURCE 定义上传的 DEST。

```javascript
const {push, pushFile} = require('fis-http-push');
const options = {receiver: 'http://example.com:8210'};

// 单个文件
pushFile('./main.js', '/var/www/main.js', options);
// 一组任务
push([{source: './main.js', dest: '/var/www/main.js'}], options);
```

`options` 中可以包含如下参数：

* receiver `string`：服务端接收 URL，例如：http://example.com:8210
* logLevel `number`：日志级别（0-6），默认为 LogLevel.INFO(2)。0 为 DEBUG，6 为 NONE。
* recursive `boolean`：是否递归，默认为 false。SOURCE 为目录时必须指定。
* retry `number`：重试次数，默认为 3。
* fastFail `boolean`：是否在第一个错误时退出，默认为 false。
* concurrent `number`：并发数，默认为 100
* parallelPushCount `number`：concurrent 的别名，兼容旧版配置。
* readEmail `(savedEmail: string) => Promise<string>`：自定义读取用户邮箱的方法。
* readCode: `() => Promise<string>`：自定义读取验证码的方法。

## 命令行接口

安装：

```bash
npm install -g fis-http-push@latest
```

上传：

```bash
fcp foo.txt http://example.com:8210/tmp/foo.txt
```

帮助：

```
> fcp --help
fcp <SOURCE..> <DEST>

Positionals:
  SOURCE..  source file or directory            [array]
  DEST      destination                         [string]

Options:
  --version        Show version number          [boolean]
  --help           Show usage instructions.     [boolean]
  --recursive, -r  push directories recursively [boolean]
  --concurrent, -c max concurrent http request  [number]
  --loglevel, -l   0,1,2,3,4,5,6                [number]
  --quiet, -q      print nothing, equiv -l 6    [boolean]
  --debug, -d      debug mode, equiv -l 0       [boolean]

Examples:
  fcp ./a.txt http://example.com:8210/tmp/a.txt  a.txt -> /tmp/a.txt
  fcp -r ./dir http://example.com:8210/tmp/dir   dir -> /tmp/dir
  fcp -r ./dir http://example.com:8210/tmp/dir/  dir -> /tmp/dir/dir
  fcp a.txt b.txt http://example.com:8210/tmp/   {a,b}.txt -> /tmp/{a,b}.txt
```

> fcp 还有 fhp, fis-http-push 两个别名，随意选用。

## Makit 中使用

```javascript
const {makit} = require('fis-http-push');
rule('http://example.com:8210/tmp/foo.txt', 'foo.txt', makit())

// 使用方式：
// makit http://example.com:8210/tmp/foo.txt
```

[demo](https://github.com/searchfe/fis-http-push/tree/master/demo) 目录包含了一个在 makit 中使用 fis-http-push 的例子。

## 多个 SOURCE

类似 scp，我们可以指定多个 SOURCE，比如：

```bash
fcp ./main.js ./foo.js ./bar.js http://example.com:8210/var/www/
```

对应的编程接口为：

```javascript
const {fcp} = require('fis-http-push');

fcp(
    ['./main.js', './foo.js', './bar.js'],
    '/var/www/',
    {receiver: 'http://example.com:8210'}
)
```

## 文件夹上传

如果 SOURCE 是一个文件夹，或者 SOURCE 中存在文件夹时，必须添加 `-r` 参数。fcp 会递归地上传其中的文件和文件夹，比如：

```bash
fcp -r foo/ http://example.com:8210/tmp/foo
```

对应的编程接口的参数是 `recursive`：

```javascript
const {fcp} = require('fis-http-push');

fcp('./src/', '/var/www/', {receiver: 'http://example.com:8210', recursive: true})
```

## 创建父目录

当 DEST 以 `/` 结尾时 DEST 会被当做父目录，且不存在时会被创建。例如：

```bash
# 将会同步到 /tmp/dist，例如 ./src/a.js -> /tmp/dist/a.js
fcp -r ./src/ http://example.com:8210/tmp/dist
# 将会同步到 /tmp/dist/src/，例如 ./src/a.js -> /tmp/dist/src/a.js
fcp -r ./src/ http://example.com:8210/tmp/dist/
```

```javascript
const {fcp} = require('fis-http-push');

// 将会同步到 /tmp/dist，例如 ./src/a.js -> /tmp/dist/a.js
fcp('./src/', '/tmp/dist', {receiver: 'http://example.com:8210', recursive: true})
// 将会同步到 /tmp/dist/src/，例如 ./src/a.js -> /tmp/dist/src/a.js
fcp('./src/', '/tmp/dist/', {receiver: 'http://example.com:8210', recursive: true})
```

注意：存在多个 SOURCE 时无论 DEST 是否以 `/` 结尾都会被当做父目录。

## 开发指南

运行测试：

```bash
npm install
npm test
```

### 打日志

1. 生产环境日志请使用 `/src/util/log`；
2. 开发环境日志请使用 `import {debug} from './util/log'` 并 `export DEBUG=fhp`。

### 文件 Mock

提供了 test/stub/fs.ts，使用示例见 test/makit.spec.ts。
