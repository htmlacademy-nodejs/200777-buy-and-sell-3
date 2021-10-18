'use strict';

const {Router} = require(`express`);
const api = require(`../api`).getAPI();

const myRouter = new Router();

// Будет доделано в следующих модулях. В данный момент: модуль 6, таск 3

myRouter.get(`/`, async (req, res) => {
  const allOffers = await api.getOffers({comments: false});

  res.render(`my-tickets`, {allOffers});
});

myRouter.get(`/comments`, async (req, res) => {
  const offers = await api.getOffers();

  res.render(`comments`, {allOffers: offers});
});

module.exports = myRouter;
