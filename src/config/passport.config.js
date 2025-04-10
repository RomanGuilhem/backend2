import passport from 'passport';
import local from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const LocalStrategy = local.Strategy;
const cookieExtractor = req => req?.cookies?.jwt || null;
const JWT_SECRET = process.env.JWT_SECRET || '123456';

export const initializePassport = () => {
  passport.use('register', new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true
  }, async (req, email, password, done) => {
    try {
      const { first_name } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return done(null, false, { message: 'Ya existe ese usuario' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ first_name, email, password: hashedPassword });
      await user.save();
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.use('login', new LocalStrategy({
    usernameField: 'email'
  }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return done(null, false, { message: 'Credenciales inválidas' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.use('jwt', new JWTStrategy({
    jwtFromRequest: cookieExtractor,
    secretOrKey: JWT_SECRET
  }, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      return done(null, user || false);
    } catch (err) {
      return done(err);
    }
  }));
};
