import { Schema, model } from 'mongoose';

const User = new Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'writer'] }
}, {
  toJSON: { virtuals: true },
  timestamps: true,
  methods: {
    isValidPassword(password: string): boolean {
      return password === this.password;
    }
  }
});

export default model('User', User);
