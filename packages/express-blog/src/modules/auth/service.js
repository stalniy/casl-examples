const mongoose = require('mongoose');
const { BadRequest } = require('http-errors');
const jwt = require('jsonwebtoken');
const { defineRulesFor } = require('./abilities');

async function create(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new BadRequest('Please specify "email" and "password" fields is "session" object');
  }

  const user = await mongoose.model('User').findOne({ email });

  if (!user || !user.isValidPassword(password)) {
    throw new BadRequest('Invalid login or password');
  }

  // TODO: make async sign
  const token = jwt.sign({ id: user.id }, req.app.get('jwt.secret'), {
    issuer: req.app.get('jwt.issuer'),
    audience: req.app.get('jwt.audience')
  });

  res.send({
    token,
    rules: defineRulesFor(user),
    email: user.email,
  });
}

module.exports = { create };
