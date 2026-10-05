import { Handler } from '@vercel/node';
import { connectDB } from '../src/config/database';
import app from '../src/app';

let isConnected = false;

const handler: Handler = async (req, res) => {
  // Connect to database if not already connected
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }

  // Let Express handle the request
  return app(req, res);
};

export default handler;

