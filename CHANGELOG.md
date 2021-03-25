## [1.6.3](https://github.com/searchfe/fis-http-push/compare/v1.6.2...v1.6.3) (2021-03-25)


### Bug Fixes

* remove makit dependency, fixes [#9](https://github.com/searchfe/fis-http-push/issues/9) ([7f9bd3c](https://github.com/searchfe/fis-http-push/commit/7f9bd3cffaec1450f67b121f8194ef9d6e90adca))

## [1.6.2](https://github.com/searchfe/fis-http-push/compare/v1.6.1...v1.6.2) (2020-11-17)


### Bug Fixes

* 补全了哪些错误需要重新鉴权，哪些错误需要重试 ([51e674a](https://github.com/searchfe/fis-http-push/commit/51e674a6cfc9fd2b30681ecaa2869d3dd65131c8))

## [1.6.1](https://github.com/searchfe/fis-http-push/compare/v1.6.0...v1.6.1) (2020-11-13)


### Bug Fixes

* 解决递归变大的 message ([f3fb4cd](https://github.com/searchfe/fis-http-push/commit/f3fb4cd71de1fab36ace09bd28556672b88f3544))

# [1.6.0](https://github.com/searchfe/fis-http-push/compare/v1.5.5...v1.6.0) (2020-07-14)


### Features

* --dryrun ([da9a11c](https://github.com/searchfe/fis-http-push/commit/da9a11ca30aee86b699f3269d192e38ee3bbdbbb))

## [1.5.5](https://github.com/searchfe/fis-http-push/compare/v1.5.4...v1.5.5) (2020-07-14)


### Bug Fixes

* add debug as dependency ([dc21f0a](https://github.com/searchfe/fis-http-push/commit/dc21f0a6d5133d9e1daadb07bc874689a2f8b591))

## [1.5.4](https://github.com/searchfe/fis-http-push/compare/v1.5.3...v1.5.4) (2020-06-30)


### Bug Fixes

* token 为空的情况 ([4a6ee43](https://github.com/searchfe/fis-http-push/commit/4a6ee4340438d36ac6b03ff862f8d081f1ab9ea7))

## [1.5.3](https://github.com/searchfe/fis-http-push/compare/v1.5.2...v1.5.3) (2020-06-05)


### Bug Fixes

* binary data uploading ([a104e40](https://github.com/searchfe/fis-http-push/commit/a104e4081ad58ffab71dbe8af5d44dc22310811f))

## [1.5.2](https://github.com/searchfe/fis-http-push/compare/v1.5.1...v1.5.2) (2020-05-15)


### Bug Fixes

* require config file path ([97bd5c6](https://github.com/searchfe/fis-http-push/commit/97bd5c6530618ff2facfae69ee1fbfe8a3ec0f41))

## [1.5.1](https://github.com/searchfe/fis-http-push/compare/v1.5.0...v1.5.1) (2020-05-14)


### Bug Fixes

* --help, --version output ([cd00723](https://github.com/searchfe/fis-http-push/commit/cd00723627f634dc720bdb27b42e84574981cab3))

# [1.5.0](https://github.com/searchfe/fis-http-push/compare/v1.4.0...v1.5.0) (2020-05-13)


### Features

* support config file name as options ([5e1fc3b](https://github.com/searchfe/fis-http-push/commit/5e1fc3b5dace2a42a64806f549553a62132e7788))

# [1.4.0](https://github.com/searchfe/fis-http-push/compare/v1.3.1...v1.4.0) (2020-05-09)


### Features

* logLevel, debug, quiet mode ([6ddbea9](https://github.com/searchfe/fis-http-push/commit/6ddbea982bbb39b6f8192d23963a75db8e3d4232))
* makit plugin, closes [#4](https://github.com/searchfe/fis-http-push/issues/4) ([a41c061](https://github.com/searchfe/fis-http-push/commit/a41c061926590baec42ad8d47c5eb0b06e220d1a))

## [1.3.1](https://github.com/searchfe/fis-http-push/compare/v1.3.0...v1.3.1) (2020-04-30)


### Bug Fixes

* 排队验证失败时错误消息会叠加 ([a2c2c97](https://github.com/searchfe/fis-http-push/commit/a2c2c9707f46bec2122fc5492bdb0717ca5ba6bd))

# [1.3.0](https://github.com/searchfe/fis-http-push/compare/v1.2.0...v1.3.0) (2020-04-28)


### Features

* concurrent limit across push calls ([9b9f0fb](https://github.com/searchfe/fis-http-push/commit/9b9f0fb1dbb213146d27b71875dc827b3a2d08c0))

# [1.2.0](https://github.com/searchfe/fis-http-push/compare/v1.1.0...v1.2.0) (2020-04-27)


### Features

* multiple source and recursive ([1ec49a2](https://github.com/searchfe/fis-http-push/commit/1ec49a242a7bb9e30819a84dbf47c891787af0a5))
* pushMultiple() ([a788e2b](https://github.com/searchfe/fis-http-push/commit/a788e2b8f32d5641bc530fabb49b4c74a8fb4ae3))

# [1.1.0](https://github.com/searchfe/fis-http-push/compare/v1.0.1...v1.1.0) (2020-04-20)


### Features

* promise singleton ([30a1813](https://github.com/searchfe/fis-http-push/commit/30a181335f64d9a68820cf03b4a3213db1ce2529))

## [1.0.1](https://github.com/searchfe/fis-http-push/compare/v1.0.0...v1.0.1) (2020-03-25)


### Bug Fixes

* 输出中的换行和格式混乱 ([0ffdb3d](https://github.com/searchfe/fis-http-push/commit/0ffdb3d7d68a0c95667202832a80015949894f80))

# 1.0.0 (2020-03-25)


### Features

* CLI usage fcp foo.txt http://example.com:8210/var/www/foo.txt, closes [#2](https://github.com/searchfe/fis-http-push/issues/2) ([90f27b0](https://github.com/searchfe/fis-http-push/commit/90f27b053f59ca2fe299fc5fec698de2bba47968))
