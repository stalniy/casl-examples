const { Strategy } = require('passport-jwt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

function findUser(payload, done) {
  const User = mongoose.model('User');

  if (payload.anonymous) {
    done(null, new User());
    return;
  }

  User.findById(payload.id)
    .then((user) => user ? done(null, user) : done(null, false))
    .catch((error) => done(error, false));
}

let ANONYMOUS_TOKEN;

function configurePassport(passport, app) {
  const options = {
    issuer: app.get('jwt.issuer'),
    audience: app.get('jwt.audience')
  };

  ANONYMOUS_TOKEN = ANONYMOUS_TOKEN || jwt.sign({ anonymous: true }, app.get('jwt.secret'), options);
  passport.use(new Strategy({
    ...options,
    secretOrKey: app.get('jwt.secret'),
    jwtFromRequest: (req) => req.headers.authorization || ANONYMOUS_TOKEN,
  }, findUser));
}

module.exports = {
  configurePassport
};
