'use strict';

const chalk = require(`chalk`);
const express = require(`express`);
const {HttpCode, API_PREFIX} = require(`../../constants`);
const routes = require(`../api`);

const DEFAULT_PORT = 3000;
const app = express();

app.use(express.json());

app.use(API_PREFIX, routes);

app.use((req, res) => res
  .status(HttpCode.NOT_FOUND)
  .send(`Такой запрос не обрабатывается`)
);

module.exports = {
  name: `--server`,
  run(args) {
    const [customPort] = args;
    const port = Number.parseInt(customPort, 10) || DEFAULT_PORT;

    app.listen(port, (err) => {
      if (err) {
        console.log(chalk.red(`Ошибка при создании сервера`, err));
      }

      console.log(chalk.green(`Сервер работает на ${port}`));
    });
  }
};
