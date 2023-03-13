'use strict';

const {Router} = require(`express`);

const category = require(`./category`);
const offers = require(`./offer`);
const user = require(`./user`);
const search = require(`./search`);

const sequelize = require(`../lib/sequelize`);
const defineModels = require(`../models`);

const {
  CategoryService,
  OfferService,
  SearchService,
  CommentService,
  UserService
} = require(`../data-service`);

const app = new Router();

defineModels(sequelize);

(() => {
  category(app, new CategoryService(sequelize));
  search(app, new SearchService(sequelize));
  offers(app, new OfferService(sequelize), new CommentService(sequelize));
  user(app, new UserService(sequelize));
})();

module.exports = app;
