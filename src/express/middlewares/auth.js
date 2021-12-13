'use strict';

module.exports = (req, res, next) => {
  const {user} = req.session;

  return user ? next() : res.redirect(`/login`);
};
