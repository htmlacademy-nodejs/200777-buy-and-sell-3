'use strict';

const {Router} = require(`express`);
const {HttpCode} = require(`../../constants`);


module.exports = (app, service) => {
  const route = new Router();

  app.use(`/search`, route);

  route.get(`/`, async (req, res) => {
    // Достаём значение запроса из объекта запроса.
    // По умолчанию значение пустой строки
    const {query = ``} = req.query;

    // Если запрос пуст, то вернём код Bad request и пустой массив в json
    if (!query) {
      res.status(HttpCode.BAD_REQUEST).json([]);
      return;
    }

    // Иначе достанем из сервиса результат на запрос
    const searchResults = await service.findAll(query);

    // В зависимости от наличия результата запроса определим код ответа
    const searchStatus = searchResults.length > 0 ? HttpCode.OK : HttpCode.NOT_FOUND;

    // Вернём определённый код ответа и json с результатом запроса
    res.status(searchStatus).json(searchResults);
  });
};
