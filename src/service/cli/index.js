'use strict';

const help = require(`./help`);
const version = require(`./version`);
const filldb = require(`./filldb`);
const server = require(`./server`);
const fill = require(`./fill.js`);

const Cli = {
  [help.name]: help,
  [version.name]: version,
  [filldb.name]: filldb,
  [server.name]: server,
  [fill.name]: fill
};

module.exports = {
  Cli,
};
