'use strict';

const {Router} = require(`express`);
const csrf = require(`csurf`);

const {ensureArray, prepareErrors, formatDate} = require(`../../utils`);
const {HttpCode, OFFERS_PER_PAGE, TypeFormatDate} = require(`../../constants`);

const upload = require(`../middlewares/upload`);
const auth = require(`../middlewares/auth`);
const api = require(`../api`).getAPI();

const csrfProtection = csrf();


const offersRouter = new Router();

const getAddOfferData = () => {
  return api.getCategories({withCount: false});
};

const getEditOfferData = async ({id, userId}) => {
  const [oneOffer, categories] = await Promise.all([
    api.getOffer({id, userId, withComments: false}),
    api.getCategories({withCount: false})
  ]);

  return [oneOffer, categories];
};

const getViewOfferData = ({id}) => {
  return api.getOffer({id, withComments: true});
};


offersRouter.get(`/category/:categoryId`, async (req, res) => {
  const {user} = req.session;
  const {categoryId} = req.params;

  let {page = 1} = req.query;
  page = +page;

  const limit = OFFERS_PER_PAGE;
  const offset = (page - 1) * OFFERS_PER_PAGE;

  const [categories, {category, count, offersByCategory}] = await Promise.all([
    api.getCategories({withCount: true}),
    api.getCategory({categoryId, limit, offset})
  ]);

  const totalPages = Math.ceil(count / OFFERS_PER_PAGE);

  const allOffers = {
    category,
    current: offersByCategory
  };

  res.render(`category`, {
    fullView: true,
    categories,
    count,
    allOffers,
    page,
    totalPages,
    user
  });
});


offersRouter.get(`/add`, auth, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const categories = await getAddOfferData();

  res.render(`offers/new-ticket`, {
    categories,
    user,
    csrfToken: req.csrfToken()
  });
});


offersRouter.get(`/edit/:id`, auth, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;

  try {
    const [offer, categories] = await getEditOfferData({id, userId: user.id});
    res.render(`offers/ticket-edit`, {
      id,
      oneOffer: offer,
      categories,
      user,
      csrfToken: req.csrfToken()
    });
  } catch (_errors) {
    res.redirect(`/my`);
  }
});


offersRouter.get(`/:id`, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;
  const oneOffer = await getViewOfferData({id});

  oneOffer.createdAt = formatDate(oneOffer.createdAt, TypeFormatDate.OFFER);

  if (oneOffer.comments.length) {
    oneOffer.comments.forEach((comment) => {
      comment.createdAt = formatDate(comment.createdAt, TypeFormatDate.COMMENT);
    });
  }

  res.render(`offers/ticket`, {
    oneOffer,
    id,
    user,
    csrfToken: req.csrfToken()
  });
});


offersRouter.post(`/add`, auth, upload.single(`avatar`), csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {body, file} = req;

  const offerData = {
    picture: file ? file.filename : ``,
    sum: body.price,
    type: body.action,
    description: body.comment,
    title: body[`ticket-name`],
    categories: ensureArray(body.category),
    userId: user.id
  };

  try {
    await api.createOffer({data: offerData});
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
    await api.editOffer({id, data: offerData});
    res.redirect(`/my`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const [oneOffer, categories] = await getEditOfferData({id});

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


offersRouter.post(`/:id/comments`, auth, csrfProtection, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;
  const {comment} = req.body;

  const commentData = {
    userId: user.id,
    text: comment
  };

  try {
    await api.createComment({id, data: commentData});

    res.redirect(`/offers/${id}`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const oneOffer = await getViewOfferData({id});

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


offersRouter.delete(`/:id`, auth, async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;

  try {
    const offer = await api.removeOffer({id, userId: user.id});

    res.status(HttpCode.OK).send(offer);
  } catch (errors) {
    res.status(errors.response.status).send(errors.response.statusText);
  }
});


offersRouter.delete(`/:id/comments/:commentId`, auth, async (req, res) => {
  const {user} = req.session;
  const {id, commentId} = req.params;

  try {
    const comment = await api.removeComment({id, userId: user.id, commentId});

    res.status(HttpCode.OK).send(comment);
  } catch (errors) {
    res.status(errors.response.status).send(errors.response.statusText);
  }
});


module.exports = offersRouter;
