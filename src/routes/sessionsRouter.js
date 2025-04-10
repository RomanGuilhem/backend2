import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || '123456';

router.post('/register', (req, res, next) => {
  passport.authenticate('register', { session: false }, async (err, user, info) => {
    if (err) {
      console.error('Error en registro:', err);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
    if (!user) {
      return res.status(400).json({ message: info?.message || 'Error al registrar usuario' });
    }

    try {
      const token = jwt.sign({ id: user._id, first_name: user.first_name }, JWT_SECRET, { expiresIn: '1h' });
      res.cookie('jwt', token, { httpOnly: true });
      return res.status(200).json({ message: 'Usuario registrado correctamente' });
    } catch (tokenError) {
      console.error('Error generando token:', tokenError);
      return res.status(500).json({ message: 'Error generando token' });
    }
  })(req, res, next);
});

router.post('/login', (req, res, next) => {
  passport.authenticate('login', { session: false }, async (err, user, info) => {
    if (err) {
      console.error('Error en login:', err);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Credenciales inválidas' });
    }

    try {
      const token = jwt.sign({ id: user._id, first_name: user.first_name }, JWT_SECRET, { expiresIn: '1h' });
      res.cookie('jwt', token, { httpOnly: true });
      return res.status(200).json({ message: 'Login exitoso' });
    } catch (tokenError) {
      console.error('Error generando token:', tokenError);
      return res.status(500).json({ message: 'Error generando token' });
    }
  })(req, res, next);
});

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.status(200).json(req.user);
});

export default router;
