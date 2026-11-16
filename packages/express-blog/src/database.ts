import mongoose from 'mongoose';

export function connectDatabase() {
  return mongoose.connect(process.env.MONGODB_URI
    || 'mongodb://root:blogpwd@localhost:27017/blog?authSource=admin&retryWrites=true&w=majority');
}
