'use strict';

const fs = require(`fs`).promises;
const chalk = require(`chalk`);

const FILE_TITLES_PATH = `./data/titles.txt`;
const FILE_SENTENCES_PATH = `./data/sentences.txt`;
const FILE_CATEGORIES_PATH = `./data/categories.txt`;

const {
  getRandomInt,
  shuffle
} = require(`../../utils.js`);

const DEFAULT_COUNT = 1;
const MAX_COUNT = 1000;
const FILE_NAME = `mocks.json`;

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
    return content.split(`\n`);
  } catch (err) {
    console.error(chalk.red(err));
    return [];
  }
};

const getRandomPictureFileName = (number) => number > 10 ? `item${number}.jpg` : `item0${number}.jpg`;

const generateOffers = (count, sentences, titles, categories) => (
  Array(count).fill({}).map(() => ({
    title: titles[getRandomInt(0, titles.length - 1)],
    picture: getRandomPictureFileName(getRandomInt(PictureRestrict.min, PictureRestrict.max)),
    description: shuffle(sentences).slice(1, 5).join(` `),
    type: Object.keys(OfferType)[getRandomInt(0, Object.keys(OfferType).length - 1)],
    sum: getRandomInt(SumRestrict.min, SumRestrict.max),
    category: Array(getRandomInt(1, categories.length - 1))
      .fill(``)
      .map(() => categories[getRandomInt(0, categories.length - 1)]),
  }))
);


module.exports = {
  name: `--generate`,
  async run(args) {
    const [count] = args;
    const countOffer = Number.parseInt(count, 10) || DEFAULT_COUNT;

    const sentences = await readContent(FILE_SENTENCES_PATH);
    const titles = await readContent(FILE_TITLES_PATH);
    const categories = await readContent(FILE_CATEGORIES_PATH);

    if (countOffer > MAX_COUNT) {
      console.log(chalk.red(`Не больше ${MAX_COUNT} объявлений`));
      return;
    }

    const content = JSON.stringify(generateOffers(countOffer, sentences, titles, categories));

    try {
      await fs.writeFile(FILE_NAME, content);
      console.log(chalk.green(`Operation success. File created.`));
    } catch(err) {
      console.error(chalk.green(`Operation success. File created.`));
    }
  }
};
