'use strict';

const {Router} = require(`express`);

const {ensureArray, prepareErrors} = require(`../../utils`);

const upload = require(`../middlewares/upload`);
const api = require(`../api`).getAPI();
const offersRouter = new Router();


const getAddOfferData = () => {
  return api.getCategories();
};

const getEditOfferData = async (offerId) => {
  const [oneOffer, categories] = await Promise.all([
    api.getOffer(offerId),
    api.getCategories()
  ]);

  return [oneOffer, categories];
};

const getViewOfferData = (offerId, comments) => {
  return api.getOffer(offerId, comments);
};


// Get add offer page
offersRouter.get(`/add`, async (req, res) => {
  const categories = await getAddOfferData();
  res.render(`offers/new-ticket`, {categories});
});


// Get edit offer by id page
offersRouter.get(`/edit/:id`, async (req, res) => {
  const {id} = req.params;
  const [oneOffer, categories] = await getEditOfferData(id);

  res.render(`offers/ticket-edit`, {id, oneOffer, categories});
});


// Get offer by id page
offersRouter.get(`/:id`, async (req, res) => {
  const {id} = req.params;
  const oneOffer = await getViewOfferData(id, true);

  res.render(`offers/ticket`, {oneOffer, id});
});


// Create new offer
offersRouter.post(`/add`, upload.single(`avatar`), async (req, res) => {
  const {body, file} = req;

  const newOfferData = {
    picture: file ? file.filename : ``,
    sum: body.price,
    type: body.action,
    description: body.comment,
    title: body[`ticket-name`],
    categories: ensureArray(body.category)
  };

  try {
    await api.createOffer(newOfferData);
    res.redirect(`/my`);
  } catch (error) {
    const validationMessages = prepareErrors(error);
    const categories = await getAddOfferData();
    res.render(`offers/new-ticket`, {
      categories,
      validationMessages
    });
  }
});


// Create offer's changes
offersRouter.post(`/edit/:id`, upload.single(`avatar`), async (req, res) => {
  const {body, file} = req;
  const {id} = req.params;
  const offerData = {
    picture: file ? file.filename : body[`old-image`],
    sum: body.price,
    type: body.action,
    description: body.comment,
    title: body[`ticket-name`],
    categories: ensureArray(body.category)
  };

  try {
    await api.editOffer(id, offerData);
    res.redirect(`/my`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const [oneOffer, categories] = await getEditOfferData(id);
    res.render(`offers/ticket-edit`, {id, oneOffer, categories, validationMessages});
  }
});


// Create comment for offer
offersRouter.post(`/:id/comments`, async (req, res) => {
  const {id} = req.params;
  const {comment} = req.body;

  try {
    await api.createComment(id, {text: comment});
    res.redirect(`/offers/${id}`);
  } catch (errors) {
    console.log(errors);
    const validationMessages = prepareErrors(errors);
    const oneOffer = await getViewOfferData(id, true);
    res.render(`offers/ticket`, {oneOffer, id, validationMessages});
  }
  return;
});

module.exports = offersRouter;
