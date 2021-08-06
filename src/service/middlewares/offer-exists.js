'use strict';

// Middleware, проверяющая существование объявления

const {HttpCode} = require(`../../constants`);

module.exports = (service) => (req, res, next) => {
  // Получаем id искомого объявления из параметров запроса
  // и ищем его в сервисе offerService, который передаём в качестве
  // параметра в этот middleware при регистрации route
  const {offerId} = req.params;
  const offer = service.findOne(offerId);

  // Если такового объявления не существует, то
  // вернём код Not found и сообщение об отсутствии объявления
  if (!offer) {
    return res.status(HttpCode.NOT_FOUND).send(`Offer with id ${offerId} not found`);
  }

  // Если объявление существует, то в объект locals передадим
  // это объявление и вызовем next();
  res.locals.offer = offer;
  return next();
};
