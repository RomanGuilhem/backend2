import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 3000,
  mongoUrl: process.env.MONGODB_URL,
  jwtSecret: process.env.JWT_SECRET,
};
