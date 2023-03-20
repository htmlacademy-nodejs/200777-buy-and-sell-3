'use strict';
const moment = require(`moment`);
moment.locale(process.env.LOCALE);

module.exports = (
    date, formatType
) => moment(new Date(date)).format(`${formatType}`);

