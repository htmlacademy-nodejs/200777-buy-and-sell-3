'use strict';

const {Router} = require(`express`);
const multer = require(`multer`);
const path = require(`path`);
const {nanoid} = require(`nanoid`);
const {ensureArray} = require(`../../utils`);

const api = require(`../api`).getAPI();
const offersRouter = new Router();

const UPLOAD_DIR = `../upload/img`;

const uploadDirAbsolute = path.resolve(__dirname, UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: uploadDirAbsolute,
  filename: (req, file, cb) => {
    const uniqueName = nanoid(10);
    const extension = file.originalname.split(`.`).pop();
    cb(null, `${uniqueName}.${extension}`);
  }
});

const upload = multer({storage});

offersRouter.get(`/add`, async (req, res) => {
  const categories = await api.getCategories();
  res.render(`offers/new-ticket`, {categories});
});

offersRouter.post(`/add`, upload.single(`avatar`), async (req, res) => {
  const {body, file} = req;

  const newOfferData = {
    picture: file ? file.filename : ``,
    sum: body.price,
    type: body.action,
    description: body.comment,
    title: body[`ticket-name`],
    category: ensureArray(body.category)
  };

  try {
    await api.createOffer(newOfferData);
    res.redirect(`/my`);
  } catch (error) {
    console.log(error.message);
    res.redirect(`back`);
  }
});

offersRouter.get(`/edit/:id`, async (req, res) => {
  const {id} = req.params;

  const [oneOffer, categories] = await Promise.all([
    api.getOffer(id),
    api.getCategories()
  ]);

  res.render(`offers/ticket-edit`, {oneOffer, categories});
});

offersRouter.get(`/category/:id`, (req, res) => res.render(`offers/category`));

offersRouter.get(`/:id`, (req, res) => res.render(`offers/ticket`));


module.exports = offersRouter;
