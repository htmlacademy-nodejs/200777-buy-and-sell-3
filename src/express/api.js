'use strict';

const axios = require(`axios`);

const TIMEOUT = 1000;

const port = process.env.API_PORT || 3000;
const defaultURL = `http://localhost:${port}/api/`;

class API {
  // При создании экземпляра данного класса
  // передадим базовый URL, на который будем
  // добавлять остальные пути
  // и время таймаута сервера
  constructor(baseURL, timeout) {
    this._http = axios.create({
      baseURL,
      timeout
    });
  }

  // Приватный метод, использующийся в дальнейшем
  // По умолчанию делает GET запрос по переданному URL
  // В options можно изменить запрос (например, на POST)
  // и передать данные
  async _load(url, options) {

    // делаем запрос по переданному url
    const response = await this._http.request({url, ...options});
    // Возвращаем результат
    return response.data;
  }

  // Передаём в приватный метод ULR `/offers/`
  // По GET - запросу API - сервер вернёт список объявлений
  // Аналогичная работа и в других методах
  getOffers() {
    return this._load(`/offers`);
  }

  getOffer(id) {
    return this._load(`/offers/${id}`);
  }

  search(query) {
    return this._load(`/search`, {params: {query}});
  }

  async getCategories() {
    return this._load(`/categories`);
  }

  async createOffer(data) {
    return this._load(`/offers`, {
      method: `POST`,
      data
    });
  }
}

// Заранее создадим экземляр API и экспортируем его
const defaultAPI = new API(defaultURL, TIMEOUT);

module.exports = {
  // А так же экспортируем сам класс
  API,
  getAPI: () => defaultAPI
};
