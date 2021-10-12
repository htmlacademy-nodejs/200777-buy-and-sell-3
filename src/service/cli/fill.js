'use strict';

const fs = require(`fs`).promises;
const chalk = require(`chalk`);

const FILE_TITLES_PATH = `./data/titles.txt`;
const FILE_SENTENCES_PATH = `./data/sentences.txt`;
const FILE_CATEGORIES_PATH = `./data/categories.txt`;
const FILE_COMMENTS_PATH = `./data/comments.txt`;
const FILENAME = `fill-db.sql`;

const {
  getRandomInt,
  shuffle
} = require(`../../utils`);

const DEFAULT_COUNT = 1;
const MAX_COMMENTS_COUNT = 4;
const MAX_COUNT = 1000;

const OfferType = {
  offer: `offer`,
  sale: `sale`,
};

const SumRestrict = {
  min: 1000,
  max: 100000,
};

const PictureRestrict = {
  min: 1,
  max: 16,
};

const readContent = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, `utf8`);
    return content
      .trim()
      .split(`\n`)
      .map((str) => str.trim())
      .filter((str) => str.length);
  } catch (err) {
    console.error(chalk.red(err));
    return [];
  }
};

const getRandomPictureFileName = (number) => `item${number.toString().padStart(2, 0)}.jpg`;

const generateComments = (count, comments, offerId, userCount) => (
  Array(count).fill({}).map(() => ({
    userId: getRandomInt(1, userCount),
    offerId,
    text: shuffle(comments)
      .slice(0, getRandomInt(1, 3))
      .join(` `),
  }))
);

const generateOffers = (count, sentences, titles, comments, categoryCount, userCount) => (
  Array(count).fill({}).map((_, index) => ({
    title: titles[getRandomInt(0, titles.length - 1)],
    picture: getRandomPictureFileName(getRandomInt(PictureRestrict.min, PictureRestrict.max)),
    description: shuffle(sentences).slice(1, 5).join(` `),
    type: Object.keys(OfferType)[getRandomInt(0, Object.keys(OfferType).length - 1)],
    sum: getRandomInt(SumRestrict.min, SumRestrict.max),
    category: [getRandomInt(1, categoryCount)],
    comments: generateComments(getRandomInt(1, MAX_COMMENTS_COUNT), comments, index + 1, userCount),
    userId: getRandomInt(1, userCount)
  }))
);


module.exports = {
  name: `--fill`,
  async run(args) {
    const sentences = await readContent(FILE_SENTENCES_PATH);
    const titles = await readContent(FILE_TITLES_PATH);
    const categories = await readContent(FILE_CATEGORIES_PATH);
    const commentSentences = await readContent(FILE_COMMENTS_PATH);

    const [count] = args;
    const countOffer = Number.parseInt(count, 10) || DEFAULT_COUNT;

    const users = [
      {
        email: `ivanov@example.com`,
        passwordHash: `5f4dcc3b5aa765d61d8327deb882cf99`,
        firstName: `Иван`,
        lastName: `Иванов`,
        avatar: `avatar1.jpg`
      }, {
        email: `petrov@example.com`,
        passwordHash: `5f4dcc3b5aa765d61d8327deb882cf99`,
        firstName: `Пётр`,
        lastName: `Петров`,
        avatar: `avatar2.jpg`
      }
    ];

    if (countOffer > MAX_COUNT) {
      console.log(chalk.red(`Не больше ${MAX_COUNT} объявлений`));
      return;
    }

    const offers = generateOffers(countOffer, sentences, titles, commentSentences, categories.length, users.length);

    const comments = offers.flatMap((offer) => offer.comments);

    const offerCategories = offers.map((offer, index) => ({offerId: index + 1, categoryId: offer.category[0]}));

    const userValues = users.map(
        ({email, passwordHash, firstName, lastName, avatar}) => `('${email}', '${passwordHash}', '${firstName}', '${lastName}', '${avatar}')`
    ).join(`,\n`);

    const categoryValues = categories.map((name) => `('${name}')`).join(`,\n`);

    const offerValues = offers.map(
        ({title, description, type, sum, picture, userId}) => `('${title}', '${description}', '${type}', ${sum}, '${picture}', ${userId})`
    ).join(`,\n`);

    const offerCategoryValues = offerCategories.map(
        ({offerId, categoryId}) => `(${offerId}, ${categoryId})`
    ).join(`,\n`);

    const commentValues = comments.map(
        ({text, userId, offerId}) => `('${text}', ${userId}, ${offerId})`
    ).join(`,\n`);

    const content = `
    -- Запрос на заполнение users пользователями
    INSERT INTO users(email, password_hash, first_name, last_name, avatar) VALUES
    ${userValues};
    
    -- Запрос на заполнение categories категориями
    INSERT INTO categories(name) VALUES
    ${categoryValues};
    
    -- Запрос на заполнение offers объявлениями
    ALTER TABLE offers DISABLE TRIGGER ALL;
    INSERT INTO offers(title, description, type, sum, picture, user_id) VALUES
    ${offerValues};
    ALTER TABLE offers ENABLE TRIGGER ALL;
    
    -- Запрос на создание связей между каждым объявлением из offers с категориями
    ALTER TABLE offer_categories DISABLE TRIGGER ALL;
    INSERT INTO offer_categories(offer_id, category_id) VALUES
    ${offerCategoryValues};
    ALTER TABLE offer_categories ENABLE TRIGGER ALL;
    
    -- Запрос на создание комментариев к объявлениям offers
    ALTER TABLE comments DISABLE TRIGGER ALL;
    INSERT INTO comments(text, user_id, offer_id) VALUES
    ${commentValues};
    ALTER TABLE comments ENABLE TRIGGER ALL;`;

    try {
      await fs.writeFile(FILENAME, content);
      console.log(chalk.green(`Operation success. File created.`));
    } catch (err) {
      console.error(chalk.green(`Operation success. File created.`));
    }
  }
};
