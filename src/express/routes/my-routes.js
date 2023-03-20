'use strict';

const {Router} = require(`express`);
const auth = require(`../middlewares/auth`);
const {formatDate} = require(`../../utils`);
const {TypeFormatDate} = require(`../../constants`);

const api = require(`../api`).getAPI();

const myRouter = new Router();

myRouter.use(auth);

myRouter.get(`/`, async (req, res) => {
  const {user} = req.session;
  const offers = await api.getOffers({userId: user.id});

  res.render(`my-tickets`, {
    user,
    allOffers: offers
  });
});

myRouter.get(`/comments`, async (req, res) => {
  const {user} = req.session;
  const offers = await api.getOffers({userId: user.id, withComments: true});

  if (offers.current.length) {
    offers.current.forEach((offer) => {
      offer.comments.forEach((comment) => {
        comment.createdAt = formatDate(comment.createdAt, TypeFormatDate.COMMENT);
      });
    });
  }

  res.render(`comments`, {
    user,
    allOffers: offers,
  });
});

module.exports = myRouter;
