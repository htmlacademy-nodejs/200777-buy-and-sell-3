'use strict';

const {Router} = require(`express`);
const api = require(`../api`).getAPI();

const myRouter = new Router();

myRouter.get(`/`, async (req, res) => {
  const allOffers = await api.getOffers();

  res.render(`my-tickets`, {allOffers});
});

myRouter.get(`/comments`, async (req, res) => {
  const allOffers = await api.getOffers({comments: true});

  res.render(`comments`, {allOffers: allOffers.slice(0, 3)});
});

module.exports = myRouter;
