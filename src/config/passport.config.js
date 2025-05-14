import passport from 'passport';
import local from 'passport-local';
import { Strategy as JWTStrategy } from 'passport-jwt';
import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository.js';

const LocalStrategy = local.Strategy;
const cookieExtractor = req => req?.cookies?.jwt || null;
const JWT_SECRET = process.env.JWT_SECRET || '123456';

const userRepo = new UserRepository();

export const initializePassport = () => {
  passport.use('register', new LocalStrategy(
    {
      usernameField: 'email',
      passReqToCallback: true
    },
    async (req, email, password, done) => {
      try {
        const { first_name } = req.body;

        const exists = await userRepo.getByEmail(email);
        if (exists) {
          return done(null, false, { message: 'Ya existe ese usuario' });
        }

        const newUser = await userRepo.register({
          first_name,
          email,
          password 
        });

        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.use('login', new LocalStrategy(
    {
      usernameField: 'email'
    },
    async (email, password, done) => {
      try {
        const user = await userRepo.getByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Credenciales inválidas' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.use('jwt', new JWTStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: JWT_SECRET
    },
    async (payload, done) => {
      try {
        const user = await userRepo.getById(payload.id);
        return done(null, user || false);
      } catch (err) {
        return done(err);
      }
    }
  ));
};
