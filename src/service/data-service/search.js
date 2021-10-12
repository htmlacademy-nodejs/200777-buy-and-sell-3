'use strict';

const {Op} = require(`sequelize`);
const Alias = require(`../models/alias`);
class SearchService {
  constructor(sequelize) {
    this._Offer = sequelize.models.Offer;
  }

  async findAll(searchText) {
    const offers = await this._Offer.findAll({
      where: {
        title: {
          [Op.substring]: searchText
        }
      },
      include: [Alias.CATEGORIES],
      order: [
        [`createdAt`, `DESC`]
      ]
    });

    return offers.map((offer) => offer.get());
  }
}

module.exports = SearchService;
