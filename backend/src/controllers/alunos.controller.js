import { query } from '../config/db.js';

export async function listar(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT a.*, u.login FROM alunos a
       LEFT JOIN usuarios u ON u.id = a.usuario_id
       ORDER BY a.nome`
    );
    res.json(rows);
  } catch (e) { next(e); }
}

export async function criar(req, res, next) {
  try {
    const { nome, cpf, email, celular, nascimento, faixa, graus, ativo } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });
    const { rows } = await query(
      `INSERT INTO alunos (nome, cpf, email, celular, nascimento, faixa, graus, ativo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [nome, cpf || null, email || null, celular || null, nascimento || null, faixa || 'Branca', graus || 0, ativo ?? true]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
}

export async function atualizar(req, res, next) {
  try {
    const { nome, email, celular, nascimento, faixa, graus, ativo } = req.body;
    const { rows } = await query(
      `UPDATE alunos SET nome=$1, email=$2, celular=$3, nascimento=$4, faixa=$5, graus=$6, ativo=$7
       WHERE id=$8 RETURNING *`,
      [nome, email, celular, nascimento, faixa, graus, ativo, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Aluno não encontrado' });
    res.json(rows[0]);
  } catch (e) { next(e); }
}

export async function excluir(req, res, next) {
  try {
    await query('DELETE FROM alunos WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (e) { next(e); }
}