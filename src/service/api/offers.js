'use strict';

const {Router} = require(`express`);
const {HttpCode} = require(`../../constants`);
const offerValidator = require(`../middlewares/offer-validator`);
const commentValidator = require(`../middlewares/comment-validator`);
const routeParamsValidator = require(`../middlewares/route-params-validator`);
const offerExists = require(`../middlewares/offer-exists`);


module.exports = (app, offerService, commentService) => {
  const route = new Router();
  app.use(`/offers`, route);


  // Get all offers
  route.get(`/`, async (req, res) => {
    const {offset, limit, comments} = req.query;

    let result;
    if (limit || offset) {
      result = await offerService.findPage({limit, offset});
    } else {
      result = await offerService.findAll(comments);
    }

    res
      .status(HttpCode.OK)
      .json(result);
  });


  // Get offer by id
  route.get(`/:offerId`, routeParamsValidator, async (req, res) => {
    const {offerId} = req.params;
    const {comments} = req.query;
    const offer = await offerService.findOne(offerId, comments);

    if (!offer) {
      return res
        .status(HttpCode.NOT_FOUND)
        .send(`Not found offer with id ${offerId}`);
    }

    return res
      .status(HttpCode.OK)
      .json(offer);
  });


  // Get offer's comments
  route.get(`/:offerId/comments`, [routeParamsValidator, offerExists(offerService)], async (req, res) => {
    const {offerId} = req.params;

    const comments = await commentService.findAll(offerId);

    res
      .status(HttpCode.OK)
      .json(comments);
  });


  // Create offer
  route.post(`/`, offerValidator, async (req, res) => {
    const offer = await offerService.create(req.body);

    res
      .status(HttpCode.CREATED)
      .json(offer);
  });


  // Create comment
  route.post(`/:offerId/comments`, [routeParamsValidator, offerExists(offerService), commentValidator], async (req, res) => {
    const {offerId} = req.params;
    const comment = await commentService.create(offerId, req.body);

    res
      .status(HttpCode.CREATED)
      .json(comment);
  });


  // Update offer
  route.put(`/:offerId`, [routeParamsValidator, offerValidator], async (req, res) => {
    const {offerId} = req.params;

    const updated = await offerService.update(offerId, req.body);

    if (!updated) {
      return res
        .status(HttpCode.NOT_FOUND)
        .send(`Not found offer with ${offerId}`);
    }

    return res
      .status(HttpCode.OK)
      .send(`Updated`);
  });


  // Delete offer
  route.delete(`/:offerId`, routeParamsValidator, async (req, res) => {
    const {offerId} = req.params;
    const offer = await offerService.drop(offerId);

    if (!offer) {
      return res
        .status(HttpCode.NOT_FOUND)
        .send(`Not found`);
    }

    return res
      .status(HttpCode.OK)
      .json(offer);
  });


  // Delete comment
  route.delete(`/:offerId/comments/:commentId`, [routeParamsValidator, offerExists(offerService)], async (req, res) => {
    const {commentId} = req.params;
    const deleted = await commentService.drop(commentId);

    if (!deleted) {
      return res
        .status(HttpCode.NOT_FOUND)
        .send(`Not found`);
    }

    return res
      .status(HttpCode.OK)
      .json(deleted);
  });
};
