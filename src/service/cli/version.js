'use strict';

const packageJsonFile = require(`../../../package.json`);

module.exports = {
  name: `--help`,
  run() {
    const version = packageJsonFile.version;
    console.log(version);
  }
};
