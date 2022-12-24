'use strict';

const {Router} = require(`express`);


const mainRouter = new Router();
const {prepareErrors} = require(`../../utils`);
const upload = require(`../middlewares/upload`);

const {OFFERS_PER_PAGE} = require(`../../constants`);

const api = require(`../api`).getAPI();


mainRouter.get(`/`, async (req, res) => {
  const {user} = req.session;

  const limit = OFFERS_PER_PAGE;

  const [
    offers,
    categories
  ] = await Promise.all([
    api.getOffers({limit}),
    api.getCategories({withCount: true})
  ]);

  res.render(`main`, {
    allOffers: offers,
    categories,
    user
  });
});


mainRouter.get(`/register`, (req, res) => {
  const {user} = req.session;
  res.render(`sign-up`, {user});
});


mainRouter.get(`/login`, (req, res) => {
  const {user} = req.session;
  res.render(`login`, {user});
});


mainRouter.get(`/search`, async (req, res) => {
  const {user} = req.session;
  const {query} = req.query;

  const limit = OFFERS_PER_PAGE;

  try {
    const [result, offers] = await Promise.all([
      api.search({query}),
      api.getOffers({limit})
    ]);

    res.render(`search-result`, {
      query,
      result,
      allOffers: offers,
      user
    });
  } catch (error) {
    const allOffers = api.getOffers({limit});

    res.render(`search-result`, {
      query,
      result: [],
      allOffers,
      user
    });
  }
});


mainRouter.get(`/logout`, (req, res) => {
  delete req.session.user;
  req.session.save(() => {
    res.redirect(`/`);
  });
});


mainRouter.post(`/register`, upload.single(`avatar`), async (req, res) => {
  const {body, file} = req;
  const userData = {
    avatar: file ? file.filename : ``,
    name: body[`user-name`],
    email: body[`user-email`],
    password: body[`user-password`],
    passwordRepeated: body[`user-password-again`]
  };

  try {
    await api.createUser({data: userData});
    res.redirect(`/login`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const {user} = req.session;
    res.render(`sign-up`, {
      validationMessages,
      user
    });
  }
});


mainRouter.post(`/login`, async (req, res) => {
  const email = req.body[`user-email`];
  const password = req.body[`user-password`];

  try {
    const user = await api.auth({email, password});
    req.session.user = user;
    req.session.save(() => {
      res.redirect(`/`);
    });
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const {user} = req.session;
    res.render(`login`, {user, validationMessages});
  }
});

module.exports = mainRouter;
