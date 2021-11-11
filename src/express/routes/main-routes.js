'use strict';

const {Router} = require(`express`);

const {OFFER_PER_PAGE} = require(`../../constants`);

const api = require(`../api`).getAPI();

const mainRouter = new Router();

mainRouter.get(`/`, async (req, res) => {
  let {page = 1} = req.query;
  page = +page;

  const limit = OFFER_PER_PAGE;

  const offset = (page - 1) * OFFER_PER_PAGE;
  const [
    {count, offers: allOffers},
    categories
  ] = await Promise.all([
    api.getOffers({limit, offset}),
    api.getCategories(true)
  ]);

  const totalPages = Math.ceil(count / OFFER_PER_PAGE);

  res.render(`main`, {allOffers, page, totalPages, categories});
});

mainRouter.get(`/register`, (req, res) => res.render(`sign-up`));
mainRouter.get(`/login`, (req, res) => res.render(`login`));

mainRouter.get(`/search`, async (req, res) => {
  try {
    const {search} = req.query;
    const results = await api.search(search);

    res.render(`search-result`, {results});
  } catch (error) {
    res.render(`search-result`, {results: []});
  }
});

module.exports = mainRouter;
