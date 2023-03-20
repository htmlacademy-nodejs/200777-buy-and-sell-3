'use strict';

const chalk = require(`chalk`);

module.exports = {
  name: `--help`,
  run() {
    const text = `
    Программа запускает http-сервер и формирует файл с данными для API.

    Гайд:
      server <command>

      Команды:

      --version:            выводит номер версии
      --help:               печатает этот текст
      --filldb <count>      заполняет БД
      --fill <count>        формирует файл fill-bd.sql
    `;

    console.log(chalk.gray(text));
  }
};
