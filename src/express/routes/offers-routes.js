'use strict';

const {Router} = require(`express`);
const csrf = require(`csurf`);

const {ensureArray, prepareErrors} = require(`../../utils`);

const upload = require(`../middlewares/upload`);
const auth = require(`../middlewares/auth`);
const api = require(`../api`).getAPI();

const csrfProtection = csrf();


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
offersRouter.get(`/add`, auth, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const categories = await getAddOfferData();

  res.render(`offers/new-ticket`, {
    categories,
    user,
    csrfToken: req.csrfToken()
  });
});


// Get edit offer by id page
offersRouter.get(`/edit/:id`, auth, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;
  const [oneOffer, categories] = await getEditOfferData(id);

  res.render(`offers/ticket-edit`, {
    id,
    oneOffer,
    categories,
    user,
    csrfToken: req.csrfToken()
  });
});


// Get offer by id page
offersRouter.get(`/:id`, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;
  const oneOffer = await getViewOfferData(id, true);

  console.log(req.session);

  res.render(`offers/ticket`, {
    oneOffer,
    id,
    user,
    csrfToken: req.csrfToken()
  });
});


offersRouter.get(`/category/:id`, (req, res) => {
  const {user} = req.session;
  res.render(`category`, {user});
});


// Create new offer
offersRouter.post(`/add`, auth, upload.single(`avatar`), csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {body, file} = req;

  const newOfferData = {
    picture: file ? file.filename : ``,
    sum: body.price,
    type: body.action,
    description: body.comment,
    title: body[`ticket-name`],
    categories: ensureArray(body.category),
    userId: user.id
  };

  try {
    await api.createOffer(newOfferData);
    res.redirect(`/my`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const categories = await getAddOfferData();
    res.render(`offers/new-ticket`, {
      categories,
      user,
      validationMessages,
      csrfToken: req.csrfToken()
    });
  }
});


// Create offer's changes
offersRouter.post(`/edit/:id`, auth, upload.single(`avatar`), csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {body, file} = req;
  const {id} = req.params;
  const offerData = {
    picture: file ? file.filename : body[`old-image`],
    sum: body.price,
    type: body.action,
    description: body.comment,
    title: body[`ticket-name`],
    categories: ensureArray(body.category),
    userId: user.id
  };

  try {
    await api.editOffer(id, offerData);
    res.redirect(`/my`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const [oneOffer, categories] = await getEditOfferData(id);
    res.render(`offers/ticket-edit`, {
      id,
      oneOffer,
      categories,
      user,
      validationMessages,
      csrfToken: req.csrfToken()
    });
  }
});


// Create comment for offer
offersRouter.post(`/:id/comments`, auth, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;
  const {comment} = req.body;

  try {
    await api.createComment(id, {text: comment, userId: user.id});
    res.redirect(`/offers/${id}`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const oneOffer = await getViewOfferData(id, true);
    res.render(`offers/ticket`, {
      oneOffer,
      id,
      validationMessages,
      user,
      csrfToken: req.csrfToken()
    });
  }
  return;
});

module.exports = offersRouter;
