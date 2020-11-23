'use strict';

const {Router} = require(`express`);
const myRouter = new Router();

myRouter.get(`/my`, (req, res) => res.send(`/my`));
myRouter.get(`/comments`, (req, res) => res.send(`/comments`));

module.exports = myRouter;
