import 'dotenv/config';
import { readFileSync } from 'node:fs';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');

async function run() {
  await pool.query(schema);

  const tabelas = [
    'avisos_lidos','bilhetes','rifas','pedido_itens','pedidos','produtos',
    'mensalidades','presencas','agendamentos','turmas','professores',
    'dependentes','alunos','usuarios','parceiros','avisos','trilha',
    'certificados','config'
  ];
  await pool.query('TRUNCATE ' + tabelas.join(', ') + ' RESTART IDENTITY CASCADE');

  const hash = bcrypt.hashSync('123456', 10);
  const ins = async (sql, params) => (await pool.query(sql, params)).rows[0];

  await ins(`INSERT INTO config (academy_name, tagline) VALUES ($1,$2)`, ['Tatame BJJ', 'SISTEMA DE GESTÃO']);

  const admin = await ins(
    `INSERT INTO usuarios (login, senha_hash, nome, perfil, email) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    ['admin', hash, 'Administrador', 'ADM', 'admin@tatame.com']
  );
  const profUser = await ins(
    `INSERT INTO usuarios (login, senha_hash, nome, perfil, email) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    ['professor', hash, 'Carlos Mendes', 'Professor', 'carlos@tatame.com']
  );
  const alunoUser = await ins(
    `INSERT INTO usuarios (login, senha_hash, nome, perfil, email) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    ['aluno', hash, 'João Silva', 'Aluno', 'joao@email.com']
  );

  const joao = await ins(
    `INSERT INTO alunos (usuario_id, nome, cpf, email, celular, nascimento, faixa, graus)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [alunoUser.id, 'João Silva', '12345678901', 'joao@email.com', '(21) 98765-4321', '2000-05-14', 'Azul', 2]
  );
  await ins(
    `INSERT INTO alunos (nome, cpf, email, celular, nascimento, faixa, graus) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    ['Bruno Costa', '98765432100', 'bruno@email.com', '(21) 97654-3210', '1995-01-30', 'Roxa', 1]
  );
  await ins(
    `INSERT INTO alunos (nome, cpf, email, celular, nascimento, faixa, graus) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    ['Mariana Souza', '11122233344', 'mari@email.com', '(21) 96543-2109', '1998-08-08', 'Branca', 0]
  );
  await ins(
    `INSERT INTO alunos (nome, cpf, email, celular, nascimento, faixa, graus) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    ['Lucas Pereira', '55566677788', 'lucas@email.com', '(21) 95432-1098', '2003-11-25', 'Azul', 0]
  );

  const prof = await ins(
    `INSERT INTO professores (usuario_id, nome, cpf, email, celular, especialidade, cref)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [profUser.id, 'Carlos Mendes', '22233344455', 'carlos@tatame.com', '(21) 98888-7777', 'Jiu-Jitsu', 'CREF-12345']
  );
  await ins(
    `INSERT INTO professores (nome, cpf, email, celular, especialidade, cref) VALUES ($1,$2,$3,$4,$5,$6)`,
    ['Rafael Lima', '33344455566', 'rafael@tatame.com', '(21) 97777-6666', 'Jiu-Jitsu Infantil', 'CREF-23456']
  );

  await ins(
    `INSERT INTO turmas (nome, professor_id, dia_semana, hora, duracao_min, vagas, cor) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    ['Jiu-Jitsu Kids', prof.id, 1, '17:00', 60, 20, '#3498db']
  );
  await ins(
    `INSERT INTO turmas (nome, professor_id, dia_semana, hora, duracao_min, vagas, cor) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    ['Jiu-Jitsu Iniciante', prof.id, 2, '19:00', 90, 25, '#e94560']
  );
  await ins(
    `INSERT INTO turmas (nome, professor_id, dia_semana, hora, duracao_min, vagas, cor) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    ['Jiu-Jitsu Avançado', prof.id, 3, '20:00', 90, 15, '#9b59b6']
  );
  await ins(
    `INSERT INTO turmas (nome, professor_id, dia_semana, hora, duracao_min, vagas, cor) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    ['Treino Livre', prof.id, 4, '18:00', 60, 30, '#f9c80e']
  );

  await ins(
    `INSERT INTO mensalidades (aluno_id, mes, valor, status, data_pagamento) VALUES ($1,$2,$3,$4,$5)`,
    [joao.id, '2026-09', 150, 'pago', '2026-09-05']
  );
  await ins(
    `INSERT INTO mensalidades (aluno_id, mes, valor, status) VALUES ($1,$2,$3)`,
    [joao.id, '2026-10', 150, 'aberto']
  );

  const kimono = await ins(
    `INSERT INTO produtos (nome, descricao, preco, estoque) VALUES ($1,$2,$3,$4) RETURNING id`,
    ['Kimono Tatame Pro', 'Kimono premium 5 oz', 349.90, 12]
  );
  await ins(
    `INSERT INTO produtos (nome, descricao, preco, estoque) VALUES ($1,$2,$3,$4)`,
    ['Faixa Azul Oficial', 'Faixa IBJJF azul', 89.90, 20]
  );
  await ins(
    `INSERT INTO produtos (nome, descricao, preco, estoque) VALUES ($1,$2,$3,$4)`,
    ['Rashguard Compressivo', 'Rashguard UV 50+', 129.90, 8]
  );

  const pedido = await ins(
    `INSERT INTO pedidos (aluno_id, total, status) VALUES ($1,$2,$3) RETURNING id`,
    [joao.id, 349.90, 'entregue']
  );
  await ins(
    `INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco) VALUES ($1,$2,$3,$4)`,
    [pedido.id, kimono.id, 1, 349.90]
  );

  const rifa = await ins(
    `INSERT INTO rifas (titulo, premio, preco, total_bilhetes) VALUES ($1,$2,$3,$4) RETURNING id`,
    ['Rifa Kimono Pro', 'Kimono Tatame Pro', 10, 100]
  );
  await ins(
    `INSERT INTO bilhetes (rifa_id, numero, aluno_id, pago) VALUES ($1,$2,$3,$4)`,
    [rifa.id, 15, joao.id, true]
  );
  await ins(
    `INSERT INTO bilhetes (rifa_id, numero, aluno_id, pago) VALUES ($1,$2,$3,$4)`,
    [rifa.id, 22, joao.id, true]
  );

  await ins(
    `INSERT INTO avisos (titulo, corpo, autor) VALUES ($1,$2,$3)`,
    ['Campeonato Interno', 'Dia 20/10 teremos o campeonato interno do Tatame BJJ. Inscrições abertas na recepção.', 'Carlos Mendes']
  );
  await ins(
    `INSERT INTO avisos (titulo, corpo, autor) VALUES ($1,$2,$3)`,
    ['Novo horário de Treino Livre', 'A partir da próxima semana, o Treino Livre passa para as 18h.', 'Carlos Mendes']
  );

  await ins(
    `INSERT INTO trilha (aluno_id, data, tipo, de, para, obs) VALUES ($1,$2,$3,$4,$5,$6)`,
    [joao.id, '2024-10-20', 'faixa', 'Branca', 'Azul', 'Promovido pelo professor']
  );
  await ins(
    `INSERT INTO trilha (aluno_id, data, tipo, de, para, obs) VALUES ($1,$2,$3,$4,$5,$6)`,
    [joao.id, '2026-03-10', 'grau', '1', '2', '2º grau na faixa azul']
  );

  await ins(
    `INSERT INTO certificados (aluno_id, titulo, data, token, emissor) VALUES ($1,$2,$3,$4,$5)`,
    [joao.id, 'Faixa Azul', '2024-10-20', 'CERT-ABC123', 'Carlos Mendes']
  );

  console.log('Seed concluído. Logins: admin/123456, professor/123456, aluno/123456');
  await pool.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});