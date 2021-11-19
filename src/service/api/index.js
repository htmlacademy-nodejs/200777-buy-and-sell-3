'use strict';

const {Router} = require(`express`);

const categories = require(`./categories`);
const offers = require(`./offers`);
const search = require(`./search`);

const sequelize = require(`../lib/sequelize`);
const defineModels = require(`../models`);

const {
  CategoryService,
  OfferService,
  SearchService,
  CommentService
} = require(`../data-service`);

const app = new Router();

defineModels(sequelize);

(() => {
  categories(app, new CategoryService(sequelize));
  search(app, new SearchService(sequelize));
  offers(app, new OfferService(sequelize), new CommentService(sequelize));
})();

module.exports = app;
