'use strict';

const {Router} = require(`express`);
const offersRouter = new Router();

offersRouter.get(`/offers/:id`, (req, res) => res.send(`/offers/:id`));
offersRouter.get(`/offers/add`, (req, res) => res.send(`/offers/add`));
offersRouter.get(`/offers/edit/:id`, (req, res) => res.send(`/offers/edit/:id`));
offersRouter.get(`/offers/category/:id`, (req, res) => res.send(`/offers/category/:id`));

module.exports = offersRouter;
