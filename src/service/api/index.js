'use strict';

const {Router} = require(`express`);

const categories = require(`./categories`);
const offers = require(`./offers`);
const search = require(`./search`);

const getMockData = require(`../lib/get-mock-data`);

const {
  CategoriesService,
  OffersService,
  SearchService,
  CommentsService
} = require(`../data-service`);

const app = new Router();

(async () => {
  const mockData = await getMockData();

  categories(app, new CategoriesService(mockData));
  search(app, new SearchService(mockData));
  offers(app, new OffersService(mockData), new CommentsService());
})();

module.exports = app;
