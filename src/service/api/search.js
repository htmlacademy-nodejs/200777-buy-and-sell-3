'use strict';

const {Router} = require(`express`);
const {HttpCode} = require(`../../constants`);

const route = new Router();

module.exports = (app, service) => {
  app.use(`/search`, route);

  route.get(`/`, (req, res) => {
    // Достаём значение запроса из объекта запроса.
    // По умолчанию значение пустой строки
    const {query = ``} = req.query;

    // Если запрос пуст, то вернём код Bad request и пустой массив в json
    if (!query) {
      return res.status(HttpCode.BAD_REQUEST).json([]);
    }

    // Иначе достанем из сервиса результат на запрос
    const searchResults = service.findAll(query);

    // В зависимости от наличия результата запроса определим код ответа
    const searchStatus = searchResults.length > 0 ? HttpCode.OK : HttpCode.NOT_FOUND;

    // Вернём определённый код ответа и json с результатом запроса
    return res.status(searchStatus).json(searchResults);
  });
};
