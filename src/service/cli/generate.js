'use strict';

const fs = require(`fs`).promises;
const chalk = require(`chalk`);
const {nanoid} = require(`nanoid`);

const FILE_TITLES_PATH = `./data/titles.txt`;
const FILE_SENTENCES_PATH = `./data/sentences.txt`;
const FILE_CATEGORIES_PATH = `./data/categories.txt`;
const FILE_COMMENTS_PATH = `./data/comments.txt`;

const {
  getRandomInt,
  shuffle
} = require(`../../utils`);

const DEFAULT_COUNT = 1;
const MAX_COUNT = 1000;
const FILE_NAME = `mocks.json`;
const MAX_COMMENTS = 4;
const {MAX_ID_LENGTH} = require(`../../constants`);

const OfferType = {
  offer: `offer`,
  sale: `sale`,
};

const SumRestrict = {
  min: 1000,
  max: 10000,
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

const getRandomPictureFileName = (number) => number > 10 ? `item${number}.jpg` : `item0${number}.jpg`;

const getRandomId = (idLength) => nanoid(idLength);

const generateComments = (count, comments) => (
  Array(count).fill({}).map(() => ({
    id: getRandomId(MAX_ID_LENGTH),
    text: shuffle(comments)
      .slice(0, getRandomInt(1, 3))
      .join(` `),
  }))
);

const generateOffers = (count, {sentences, titles, categories, comments}) => (
  Array(count).fill({}).map(() => ({
    id: getRandomId(MAX_ID_LENGTH),
    title: titles[getRandomInt(0, titles.length - 1)],
    picture: getRandomPictureFileName(getRandomInt(PictureRestrict.min, PictureRestrict.max)),
    description: shuffle(sentences).slice(1, 5).join(` `),
    type: Object.keys(OfferType)[getRandomInt(0, Object.keys(OfferType).length - 1)],
    sum: getRandomInt(SumRestrict.min, SumRestrict.max),
    category: Array(getRandomInt(1, categories.length - 1))
      .fill(``)
      .map(() => categories[getRandomInt(0, categories.length - 1)]),
    comments: generateComments(getRandomInt(1, MAX_COMMENTS), comments),
  }))
);


module.exports = {
  name: `--generate`,
  async run(args) {
    const [count] = args;
    const countOffer = Number.parseInt(count, 10) || DEFAULT_COUNT;

    const mockData = {
      sentences: await readContent(FILE_SENTENCES_PATH),
      titles: await readContent(FILE_TITLES_PATH),
      categories: await readContent(FILE_CATEGORIES_PATH),
      comments: await readContent(FILE_COMMENTS_PATH),
    };


    if (countOffer > MAX_COUNT) {
      console.log(chalk.red(`Не больше ${MAX_COUNT} объявлений`));
      return;
    }

    const content = JSON.stringify(generateOffers(countOffer, mockData));

    try {
      await fs.writeFile(FILE_NAME, content);
      console.log(chalk.green(`Operation success. File created.`));
    } catch (err) {
      console.error(chalk.green(`Operation success. File created.`));
    }
  }
};
