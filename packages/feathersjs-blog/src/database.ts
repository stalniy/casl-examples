import mongoose from 'mongoose';
import { createModels } from './models/index.ts';

export async function connectDatabase() {
  const connection = mongoose.createConnection(process.env.MONGODB_URI
    || 'mongodb://root:blogpwd@localhost:27017/blog?authSource=admin&retryWrites=true&w=majority');
  try {
    await connection.asPromise();
    return { connection, ...createModels(connection) };
  } catch (error) {
    await connection.close();
    throw error;
  }
}
