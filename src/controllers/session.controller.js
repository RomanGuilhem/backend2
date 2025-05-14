import jwt from 'jsonwebtoken';
import UserDTO from '../dto/user.dto.js';

const JWT_SECRET = process.env.JWT_SECRET || '123456';

export const register = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ status: 'error', message: 'Registro fallido: datos inválidos o usuario ya existe' });
  }

  const token = jwt.sign({ id: user._id, first_name: user.first_name }, JWT_SECRET, { expiresIn: '1h' });
  res.cookie('jwt', token, { httpOnly: true });
  res.status(200).json({ status: 'success', message: 'Usuario registrado correctamente' });
};

export const login = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
  }

  const token = jwt.sign({ id: user._id, first_name: user.first_name }, JWT_SECRET, { expiresIn: '1h' });
  res.cookie('jwt', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 3600000, 
});

  res.status(200).json({ status: 'success', message: 'Login exitoso' });
};

export const getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'No autorizado' });
  }

  const userDTO = new UserDTO(req.user);
  return res.status(200).json({ status: 'success', user: userDTO });
};
