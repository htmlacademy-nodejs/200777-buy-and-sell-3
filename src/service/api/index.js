'use strict';

const {Router} = require(`express`);

const categories = require(`./categories`);
const offers = require(`./offers`);
const search = require(`./search`);

const sequelize = require(`../lib/sequelize`);
const defineModels = require(`../models`);

const {
  CategoriesService,
  OffersService,
  SearchService,
  CommentsService
} = require(`../data-service`);

const app = new Router();

defineModels(sequelize);

(() => {
  categories(app, new CategoriesService(sequelize));
  search(app, new SearchService(sequelize));
  offers(app, new OffersService(sequelize), new CommentsService(sequelize));
})();

module.exports = app;
