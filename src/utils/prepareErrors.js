'use strict';

module.exports = (errors) => {
  return errors.response.data.split(`\n`);
};
