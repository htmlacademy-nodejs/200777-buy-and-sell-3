'use strict';

const {Model} = require(`sequelize`);

const Alias = require(`./alias`);

const defineCategory = require(`./category`);
const defineComment = require(`./comment`);
const defineOffer = require(`./offer`);

class OfferCategory extends Model {}

const define = (sequelize) => {
  const Category = defineCategory(sequelize);
  const Comment = defineComment(sequelize);
  const Offer = defineOffer(sequelize);

  Offer.hasMany(Comment, {
    as: Alias.COMMENTS,
    foreignKey: `offer_id`,
    onDelete: `cascade`
  });

  Comment.belongsTo(Offer, {
    foreignKey: `offer_id`
  });

  OfferCategory.init({}, {
    sequelize,
    tableName: `offer_categories`
  });

  Offer.belongsToMany(Category, {
    through: OfferCategory,
    as: Alias.CATEGORIES
  });

  Category.belongsToMany(Offer, {
    through: OfferCategory,
    as: Alias.OFFERS
  });

  Category.hasMany(OfferCategory, {
    as: Alias.OFFER_CATEGORIES
  });

  return {Category, Comment, Offer, OfferCategory};
};

module.exports = define;
