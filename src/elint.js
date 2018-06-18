'use strict';

const co = require('co');
const _ = require('lodash');
const walker = require('./walker');
const report = require('./utils/report');
const eslint = require('./workers/eslint');
const stylelint = require('./workers/stylelint');

/**
 * @typedef ELintOptions
 * @property {stirng} type lint 类型
 * @property {boolean} fix 是否自动修复问题
 */

/**
 * 主函数
 *
 * @param {string[]} files 待执行 lint 的文件
 * @param {ELintOptions} options options
 * @returns {void}
 */
function elint(files, options) {
  co(function* () {
    const fileList = yield walker(files, options);

    // 没有匹配到任何文件，直接退出
    if (!fileList.es.length && !fileList.style.length) {
      process.exit();
    }

    const linters = {
      es: eslint,
      style: stylelint
    };

    const { type } = options;
    const argus = JSON.stringify(options);
    let workers = [];

    if (type) {
      workers.push(linters[type](argus, ...fileList[type]));
    } else {
      // 兼容 node v6
      _.toPairs(linters).forEach(([linterType, linter]) => {
        workers.push(linter(argus, ...fileList[linterType]));
      });
    }

    Promise.all(workers).then(results => {
      const outputs = [];
      let success = true;

      results.forEach(result => {
        const output = JSON.parse(result.stdout);
        outputs.push(output);
        success = success && output.success;
      });

      report(outputs);

      process.exit(success ? 0 : 1);
    });
  });
}

module.exports = elint;
