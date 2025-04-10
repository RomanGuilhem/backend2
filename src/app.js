import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import handlebars from 'express-handlebars';
import { __dirname } from './utils.js';
import sessionsRouter from './routes/sessionsRouter.js';
import { initializePassport } from './config/passport.config.js';
import passport from 'passport';
import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_DB_URL;
const JWT_SECRET = process.env.JWT_SECRET || '123456';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

initializePassport();
app.use(passport.initialize());

app.use('/api/sessions', sessionsRouter);

app.use(async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }
  next();
});

app.get('/', (req, res) => {
  if (!req.user) {
    return res.redirect('/login');
  }

  res.render('index', { firstName: req.user.first_name });
});

app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
