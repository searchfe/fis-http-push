# fis-http-push
[![npm version](https://img.shields.io/npm/v/fis-http-push.svg)](https://www.npmjs.org/package/fis-http-push)
[![downloads](https://img.shields.io/npm/dm/fis-http-push.svg)](https://www.npmjs.org/package/fis-http-push)
[![Build Status](https://travis-ci.org/searchfe/fis-http-push.svg?branch=master)](https://travis-ci.org/searchfe/fis-http-push)
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

demo/ 下有完整的例子，主要包括 `push`, `pushMultiple`, `cp` 三个接口，都返回 `Promise<void>`。

```javascript
const {push, pushMultiple} = require('fis-http-push');
// 单个文件 push
push('./main.js', '/var/www/main.js', {receiver: 'http://example.com:8210'})
// 多个文件 push
pushMultiple([
  {path: './main.js', to: '/var/www/main.js'},
  {path: './foo.js', to: '/var/www/foo.js'},
  {path: './bar.js', to: '/var/www/bar.js'}
], {receiver: 'http://example.com:8210'})
// 拷贝，支持目录类似 GNU 的 scp
cp('./src/', '/var/www/', {receiver: 'http://example.com:8210', recursive: true})
```

## 命令行接口

```bash
npm i -g fis-http-push
# 上传一个文件
fcp ./main.js http://example.com:8210/var/www/main.js
# 上传一个目录
fcp -r ./src/ http://example.com:8210/var/www/
# 上传多个文件、目录
fcp -r ./src/ main.js dist/ http://example.com:8210/var/www/
```

## Makit 中使用

```javascript
const {push} = require('fis-http-push');
rule('deploy:/tmp/foo.txt', 'foo.txt', ctx => push('foo.txt', '/tmp/foo.txt', {receiver: 'http://example.com:8210'}))
// 使用方式：
// makit deploy:/tmp/foo.txt
```

## 开发指南

运行测试：

```bash
npm install
npm test
```

打日志：由于 mock-fs 和 Jest 对 `console.log` 的处理存在冲突。生产环境日志请使用 `/src/util/log`；开发环境日志请使用 `import 'debug'`。
