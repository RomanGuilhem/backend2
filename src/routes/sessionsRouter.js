import { Router } from 'express';
import passport from 'passport';
import * as sessionController from '../controllers/session.controller.js';

const router = Router();

const customPassport = (strategy) => (req, res, next) => {
  passport.authenticate(strategy, { session: false }, (err, user, info) => {
    if (err) {
      console.error(`Error en estrategia ${strategy}:`, err);
      return res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: info?.message || `Falló la autenticación con estrategia ${strategy}`
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};


router.post('/register', customPassport('register'), sessionController.register);
router.post('/login', customPassport('login'), sessionController.login);
router.get('/current', customPassport('jwt'), sessionController.getCurrentUser);

export default router;
