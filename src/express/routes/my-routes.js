'use strict';

const {Router} = require(`express`);
const auth = require(`../middlewares/auth`);

const api = require(`../api`).getAPI();

const myRouter = new Router();

myRouter.use(auth);

myRouter.get(`/`, async (req, res) => {
  const {user} = req.session;
  const allOffers = await api.getOffers();

  res.render(`my-tickets`, {
    user,
    allOffers
  });
});

myRouter.get(`/comments`, async (req, res) => {
  const {user} = req.session;
  const offers = await api.getOffers();

  res.render(`comments`, {
    user,
    allOffers: offers.slice(0, 3),
  });
});

module.exports = myRouter;
