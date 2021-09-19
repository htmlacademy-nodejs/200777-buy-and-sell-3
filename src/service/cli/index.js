'use strict';

const help = require(`./help`);
const version = require(`./version`);
const generate = require(`./generate`);
const server = require(`./server`);
const fill = require(`./fill.js`);

const Cli = {
  [help.name]: help,
  [version.name]: version,
  [generate.name]: generate,
  [server.name]: server,
  [fill.name]: fill
};

module.exports = {
  Cli,
};
