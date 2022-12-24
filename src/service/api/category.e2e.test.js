'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);

const initDB = require(`../lib/init-db`);
const passwordUtils = require(`../lib/password`);
const category = require(`./category`);
const DataService = require(`../data-service/category`);

const {HttpCode} = require(`../../constants`);

const mockCategories = [
  `Животные`,
  `Журналы`,
  `Игры`
];

const mockUsers = [
  {
    name: `Иван Иванов`,
    email: `ivanov@example.com`,
    passwordHash: passwordUtils.hashSync(`ivanov`),
    avatar: `avatar01.jpg`
  },
  {
    name: `Пётр Петров`,
    email: `petrov@example.com`,
    passwordHash: passwordUtils.hashSync(`petrov`),
    avatar: `avatar02.jpg`
  }
];

const mockOffers = [
  {
    "user": `ivanov@example.com`,
    "categories": [
      `Игры`,
      `Журналы`
    ],
    "comments": [
      {
        "user": `petrov@example.com`,
        "text": `С чем связана продажа? Почему так дешёво? Неплохо, но дорого. А где блок питания?`
      },
      {
        "user": `ivanov@example.com`,
        "text": `А где блок питания?`
      },
      {
        "user": `petrov@example.com`,
        "text": `Оплата наличными или перевод на карту? Неплохо, но дорого. Почему в таком ужасном состоянии?`
      }
    ],
    "description": `Бонусом отдам все аксессуары. Если товар не понравится — верну всё до последней копейки. Товар в отличном состоянии. Это настоящая находка для коллекционера!`,
    "picture": `item13.jpg`,
    "title": `Куплю антиквариат`,
    "type": `OFFER`,
    "sum": 10030
  },
  {
    "user": `petrov@example.com`,
    "categories": [
      `Игры`
    ],
    "comments": [
      {
        "user": `ivanov@example.com`,
        "text": `А где блок питания? С чем связана продажа? Почему так дешёво?`
      },
      {
        "user": `petrov@example.com`,
        "text": `А сколько игр в комплекте?`
      },
      {
        "user": `ivanov@example.com`,
        "text": `Оплата наличными или перевод на карту? Вы что?! В магазине дешевле.`
      }
    ],
    "description": `Это настоящая находка для коллекционера! Если найдёте дешевле — сброшу цену. Продаю с болью в сердце... Товар в отличном состоянии.`,
    "picture": `item06.jpg`,
    "title": `Куплю породистого кота`,
    "type": `OFFER`,
    "sum": 6694
  },
  {
    "user": `petrov@example.com`,
    "categories": [
      `Журналы`,
      `Животные`
    ],
    "comments": [
      {
        "user": `ivanov@example.com`,
        "text": `Совсем немного... А сколько игр в комплекте? Неплохо, но дорого.`
      }
    ],
    "description": `Пользовались бережно и только по большим праздникам. Продаю с болью в сердце... Даю недельную гарантию. Если товар не понравится — верну всё до последней копейки.`,
    "picture": `item16.jpg`,
    "title": `Продам слона`,
    "type": `SALE`,
    "sum": 87784
  },
  {
    "user": `petrov@example.com`,
    "categories": [
      `Игры`
    ],
    "comments": [
      {
        "user": `ivanov@example.com`,
        "text": `А сколько игр в комплекте? Продаю в связи с переездом. Отрываю от сердца.`
      },
      {
        "user": `ivanov@example.com`,
        "text": `С чем связана продажа? Почему так дешёво?`
      }
    ],
    "description": `При покупке с меня бесплатная доставка в черте города. Бонусом отдам все аксессуары. Если найдёте дешевле — сброшу цену. Продаю с болью в сердце...`,
    "picture": `item13.jpg`,
    "title": `Продам отличную подборку фильмов на VHS`,
    "type": `SALE`,
    "sum": 54264
  },
  {
    "user": `ivanov@example.com`,
    "categories": [
      `Животные`
    ],
    "comments": [
      {
        "user": `petrov@example.com`,
        "text": `Оплата наличными или перевод на карту?`
      },
      {
        "user": `ivanov@example.com`,
        "text": `Почему в таком ужасном состоянии? Совсем немного...`
      },
      {
        "user": `ivanov@example.com`,
        "text": `Продаю в связи с переездом. Отрываю от сердца. Оплата наличными или перевод на карту? Вы что?! В магазине дешевле.`
      },
      {
        "user": `petrov@example.com`,
        "text": `С чем связана продажа? Почему так дешёво? А сколько игр в комплекте?`
      }
    ],
    "description": `Таких предложений больше нет! Даю недельную гарантию. Продаю с болью в сердце... Пользовались бережно и только по большим праздникам.`,
    "picture": `item15.jpg`,
    "title": `Куплю породистого кота`,
    "type": `OFFER`,
    "sum": 91863
  }
];

const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});

const app = express();
app.use(express.json());

beforeAll(async () => {
  await initDB(mockDB, {categories: mockCategories, offers: mockOffers, users: mockUsers});
  category(app, new DataService(mockDB));
});

describe(`API returns category list`, () => {

  let response;

  beforeAll(async () => {
    response = await request(app)
      .get(`/category`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`Returns list of 3 categories`, () => expect(response.body.length).toBe(3));

  test(`Category names are "Журналы", "Игры", "Животные"`,
      () => expect(response.body.map((it) => it.name)).toEqual(
          expect.arrayContaining([`Журналы`, `Игры`, `Животные`])
      )
  );
});
