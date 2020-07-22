const mongoose = require('mongoose');

const { Schema } = mongoose;

module.exports = function () {
  const Comment = new Schema({
    author: { type: String, required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    text: { type: String, required: true },
  }, {
    timestamps: true
  });

  return mongoose.model('Comment', Comment);
};
