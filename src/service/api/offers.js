'use strict';

const {Router} = require(`express`);
const {HttpCode} = require(`../../constants`);
const offerValidator = require(`../middlewares/offer-validator`);
const commentValidator = require(`../middlewares/comment-validator`);
const offerExists = require(`../middlewares/offer-exists`);


// Модуль принимает приложение и сервисы для работы
module.exports = (app, offerService, commentService) => {
  const route = new Router();
  // Присваиваем экземпляр роутера к приложению,
  // и затем прописываем к нему маршруты
  app.use(`/offers`, route);


  // Получить все объявления
  route.get(`/`, async (req, res) => {
    // Находим в сервисе все объявления
    const {offset, limit, comments} = req.query;

    let result;
    if (limit || offset) {
      result = await offerService.findPage({limit, offset});
    } else {
      result = offerService.findAll(comments);
    }

    // Возвращаем их
    return res
      .status(HttpCode.OK)
      .json(result);
  });


  // Получить объявление по id
  route.get(`/:offerId`, async (req, res) => {
    // Получаем id из параметров запроса и ищем по нему объявление
    const {offerId} = req.params;
    const {comments} = req.query;
    const offer = await offerService.findOne(offerId, comments);

    // Если таковое отсутствует, то возвращаем код Not found с сообщением
    if (!offer) {
      return res
        .status(HttpCode.NOT_FOUND)
        .send(`Not found offer with id ${offerId}`);
    }

    // В случае успеха вернём соответствующй код и искомое объявление
    return res
      .status(HttpCode.OK)
      .json(offer);
  });


  // Создать объявление
  route.post(`/`, offerValidator, async (req, res) => {
    // Обращаемся к сервису: создаём объявление с переданными в запросе данными
    const offer = await offerService.create(req.body);

    // Отправляем сообщение об успешном создании и прикрепляем объявление
    return res
      .status(HttpCode.CREATED)
      .json(offer);
  });


  // Изменить/обновить объявление по id
  route.put(`/:offerId`, offerValidator, async (req, res) => {
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


  // Удалить объявление по id
  route.delete(`/:offerId`, async (req, res) => {
    // Получаем id удаляемого объявления из параметра
    // запроса и удаляем таковое в сервисе объявлений
    const {offerId} = req.params;
    const offer = await offerService.drop(offerId);

    // Если такового нет, то "Not found" с сообщением об этом
    if (!offer) {
      return res
        .status(HttpCode.NOT_FOUND)
        .send(`Not found`);
    }

    // Если всё ОК, то вернём ОК-код и удалённое объявление
    return res
      .status(HttpCode.OK)
      .json(offer);
  });


  // Получить список комментариев определённого объявления
  route.get(`/:offerId/comments`, offerExists(offerService), async (req, res) => {
    const {offerId} = req.params;

    const comments = await commentService.findAll(offerId);

    // Вернём успешный статус и json с массивом комментариев
    return res
      .status(HttpCode.OK)
      .json(comments);
  });


  // Удалить комментарий по id
  route.delete(`/:offerId/comments/:commentId`, offerExists(offerService), async (req, res) => {
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


  // Создать новый комментарий к объявлению
  route.post(`/:offerId/comments`, [offerExists(offerService), commentValidator], async (req, res) => {
    // Через offerExists проверим наличие объявления
    // и вернём его через объект locals у объекта ответа
    const {offer} = res.locals;
    // Создадим комментарий с помощью commentService, передав
    // туда объявление и объект с текстом комментария
    const comment = await commentService.create(offer, req.body);

    // Вернём созданный комментарий
    return res
      .status(HttpCode.CREATED)
      .json(comment);
  });
};
