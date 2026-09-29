import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export async function login(req, res, next) {
  try {
    const { login, senha } = req.body;
    if (!login || !senha) return res.status(400).json({ error: 'Informe login e senha' });

    const { rows } = await query('SELECT * FROM usuarios WHERE login = $1', [login]);
    const user = rows[0];
    if (!user || !bcrypt.compareSync(senha, user.senha_hash)) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: user.id, perfil: user.perfil, nome: user.nome },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { id: user.id, nome: user.nome, perfil: user.perfil, email: user.email, foto: user.foto }
    });
  } catch (e) {
    next(e);
  }
}