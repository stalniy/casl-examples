import { Schema, model } from 'mongoose';

const Comment = new Schema({
  author: { type: String, required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  text: { type: String, required: true },
}, {
  toJSON: { virtuals: true },
  timestamps: true
});

export default model('Comment', Comment);
