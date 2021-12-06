'use strict';

const {Router} = require(`express`);


const {prepareErrors} = require(`../../utils`);
const upload = require(`../middlewares/upload`);

const {OFFER_PER_PAGE} = require(`../../constants`);

const api = require(`../api`).getAPI();

const mainRouter = new Router();

mainRouter.get(`/`, async (req, res) => {
  const {user} = req.session;
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

  res.render(`main`, {
    allOffers,
    page,
    totalPages,
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

  try {
    const {search} = req.query;
    const results = await api.search(search);

    res.render(`search-result`, {
      results,
      user
    });
  } catch (error) {
    res.render(`search-result`, {
      results: [],
      user
    });
  }
});


mainRouter.get(`/logout`, (req, res) => {
  delete req.session.user;
  res.redirect(`/`);
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
    await api.createUser(userData);
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
  try {
    const user = api.auth(req.body[`user-email`], req.body[`user-password`]);
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
