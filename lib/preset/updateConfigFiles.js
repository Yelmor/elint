'use strict';

const debug = require('debug')('elint:preset:updateConfigFile');
const fs = require('fs-extra');
const path = require('path');
const jsDiff = require('diff');
const { baseDir } = require('../utils/env');

/**
 * 判断两个文件是否一致
 */
function isSameFile(newFilePath, oldFilePath) {
  const newFileContent = fs.readFileSync(newFilePath, { encoding: 'utf-8' });
  const oldFileContent = fs.readFileSync(oldFilePath, { encoding: 'utf-8' });

  const diff = jsDiff.structuredPatch('', '', newFileContent, oldFileContent);

  return !diff.hunks.length;
}

/**
 * 更新配置文件
 */
function updateConfigFiles(filePath, keep) {
  debug(`file path: ${filePath}`);

  if (typeof filePath !== 'string' || !fs.existsSync(filePath)) {
    debug(`file not exists: ${filePath}`);
    return;
  }

  const fileParsedObj = path.parse(filePath);
  const fileName = `${fileParsedObj.name}${fileParsedObj.ext}`;
  const destFilePath = path.join(baseDir, fileName);
  const oldFilePath = path.join(
    baseDir,
    `${fileParsedObj.name}.old${fileParsedObj.ext}`
  );

  debug(`file dest path: ${destFilePath}`);

  // 旧文件存在，rename
  if (keep === true && fs.existsSync(destFilePath)) {
    if (isSameFile(filePath, destFilePath)) {
      debug('file exists, file same, ignore');
      return;
    }

    debug('file exists, file different, move.');
    debug(`file old name: ${oldFilePath}`);
    fs.moveSync(destFilePath, oldFilePath, { overwrite: true });
  }

  fs.copySync(filePath, destFilePath);
}

module.exports = updateConfigFiles;