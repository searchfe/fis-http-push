# fis-http-push

FIS HTTP Push SDK, 用于 push 文件到 Fis Secure Receiver（新版的 fis http-push）。

## 编程接口

demo/ 下有完整的例子。

```javascript
const {push} = require('fis-http-push');
push('./main.js', '/var/www/main.js', {receiver: 'http://example.com:8210'})
```

## 命令行接口

```bash
npm i -g fis-http-push
fcp ./main.js http://example.com:8210/var/www/main.js
```

## Makit 中使用

```javascript
const {push} = require('fis-http-push');
rule('http://example.com:8210/foo.txt', 'foo.txt', push)
```
