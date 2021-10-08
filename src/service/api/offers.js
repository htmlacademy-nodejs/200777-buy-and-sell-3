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
  route.get(`/`, (req, res) => {
    // Находим в сервисе все объявления
    const offers = offerService.findAll();

    // Возвращаем их
    return res.status(HttpCode.OK).send(offers);
  });


  // Получить объявление по id
  route.get(`/:offerId`, async (req, res) => {
    // Получаем id из параметров запроса и ищем по нему объявление
    const {offerId} = req.params;
    const {comments} = req.query;
    const offer = await offerService.findOne(offerId, comments);

    // Если таковое отсутствует, то возвращаем код Not found с сообщением
    if (!offer) {
      return res.status(HttpCode.NOT_FOUND).send(`Not found offer with id ${offerId}`);
    }

    // В случае успеха вернём соответствующй код и искомое объявление
    return res.status(HttpCode.OK).json(offer);
  });


  // Создать объявление
  route.post(`/`, offerValidator, (req, res) => {
    // Обращаемся к сервису: создаём объявление с переданными в запросе данными
    const offer = offerService.create(req.body);

    // Отправляем сообщение об успешном создании и прикрепляем объявление
    return res.status(HttpCode.CREATED).json(offer);
  });


  // Изменить/обновить объявление по id
  route.put(`/:offerId`, offerValidator, (req, res) => {
    // Получаем id объявления из параметров и по нему ищем в сервисе
    const {offerId} = req.params;
    const existOffer = offerService.findOne(offerId);

    // Если таковое отсутствует, то вернём "Not found" и сообщение об этом
    if (!existOffer) {
      return res.status(HttpCode.NOT_FOUND).send(`Not found offer with id ${offerId}`);
    }

    // Если есть, то обновляем это объявление, передав id
    // для поиска старого и данные из тела запроса для обновления
    const updatedOffer = offerService.update(offerId, req.body);

    // Возвращаем статус успеха и обновлённое объявление
    return res.status(HttpCode.OK).json(updatedOffer);
  });


  // Удалить объявление по id
  route.delete(`/:offerId`, (req, res) => {
    // Получаем id удаляемого объявления из параметра
    // запроса и удаляем таковое в сервисе объявлений
    const {offerId} = req.params;
    const offer = offerService.drop(offerId);

    // Если такового нет, то "Not found" с сообщением об этом
    if (!offer) {
      return res.status(HttpCode.NOT_FOUND).send(`Not found`);
    }

    // Если всё ОК, то вернём ОК-код и удалённое объявление
    return res.status(HttpCode.OK).json(offer);
  });


  // Получить список комментариев определённого объявления
  route.get(`/:offerId/comments`, offerExists(offerService), (req, res) => {
    // Через offerExists проверим наличие объявления
    // и вернём его через объект locals у объекта ответа
    const {offer} = res.locals;

    // Далее найденное объявление передадим в сервис
    // для работы с комментариями и найдём массив комментариев
    const comments = commentService.findAll(offer);

    // Вернём успешный статус и json с массивом комментариев
    return res.status(HttpCode.OK).json(comments);
  });


  // Удалить комментарий по id
  route.delete(`/:offerId/comments/:commentId`, offerExists(offerService), (req, res) => {
    // Через offerExists проверим наличие объявления
    // и вернём его через объект locals у объекта ответа
    const {offer} = res.locals;
    // Возьмём id удаляемого комментария
    // и удалим таковой в commentService
    const {commentId} = req.params;
    const deletedComment = commentService.drop(offer, commentId);

    // Если вернётся null,
    // то вернём Not found
    if (!deletedComment) {
      return res.status(HttpCode.NOT_FOUND).send(`Not found`);
    }

    // Иначе всё ОК, вернём удалённый комментарий
    return res.status(HttpCode.OK).json(deletedComment);
  });


  // Создать новый комментарий к объявлению
  route.post(`/:offerId/comments`, [offerExists(offerService), commentValidator], (req, res) => {
    // Через offerExists проверим наличие объявления
    // и вернём его через объект locals у объекта ответа
    const {offer} = res.locals;
    // Создадим комментарий с помощью commentService, передав
    // туда объявление и объект с текстом комментария
    const comment = commentService.create(offer, req.body);

    // Вернём созданный комментарий
    return res.status(HttpCode.CREATED).json(comment);
  });
};
