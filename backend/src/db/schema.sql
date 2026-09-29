-- Tatame BJJ: esquema do banco (PostgreSQL)
-- Executado pelo seed.js e por npm run db:schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS config (
  id SERIAL PRIMARY KEY,
  academy_name TEXT NOT NULL DEFAULT 'Tatame BJJ',
  tagline TEXT NOT NULL DEFAULT 'SISTEMA DE GESTÃO',
  primary_color TEXT NOT NULL DEFAULT '#e94560',
  secondary_color TEXT NOT NULL DEFAULT '#f9c80e',
  subdomain TEXT UNIQUE
);

-- Perfis: ADM, Professor, Aluno
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  login TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  perfil TEXT NOT NULL CHECK (perfil IN ('ADM','Professor','Aluno')),
  email TEXT,
  foto TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alunos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  email TEXT,
  celular TEXT,
  nascimento DATE,
  faixa TEXT NOT NULL DEFAULT 'Branca',
  graus INT NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  foto TEXT,
  nota TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dependentes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titular_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  dependente_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  parentesco TEXT,
  UNIQUE (titular_id, dependente_id)
);

CREATE TABLE IF NOT EXISTS professores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  email TEXT,
  celular TEXT,
  especialidade TEXT,
  cref TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS turmas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  professor_id UUID REFERENCES professores(id) ON DELETE SET NULL,
  dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora TIME NOT NULL,
  duracao_min INT NOT NULL DEFAULT 60,
  vagas INT NOT NULL DEFAULT 20,
  cor TEXT NOT NULL DEFAULT '#e94560'
);

CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmado',
  UNIQUE (aluno_id, turma_id, data)
);

CREATE TABLE IF NOT EXISTS presencas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  presente BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (aluno_id, turma_id, data)
);

CREATE TABLE IF NOT EXISTS mensalidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  mes TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto','pago')),
  data_pagamento DATE,
  UNIQUE (aluno_id, mes)
);

CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC(10,2) NOT NULL,
  estoque INT NOT NULL DEFAULT 0,
  foto TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE SET NULL,
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  data DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS pedido_itens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id),
  quantidade INT NOT NULL,
  preco NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS rifas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  premio TEXT,
  preco NUMERIC(10,2) NOT NULL,
  total_bilhetes INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa','sorteada')),
  data_sorteio DATE,
  vencedor_bilhete_id UUID,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bilhetes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rifa_id UUID NOT NULL REFERENCES rifas(id) ON DELETE CASCADE,
  numero INT NOT NULL,
  aluno_id UUID REFERENCES alunos(id) ON DELETE SET NULL,
  pago BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (rifa_id, numero)
);

CREATE TABLE IF NOT EXISTS parceiros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  categoria TEXT,
  tipo TEXT NOT NULL DEFAULT 'parceiro' CHECK (tipo IN ('parceiro','sponsor')),
  contato TEXT,
  logo TEXT,
  descricao TEXT
);

CREATE TABLE IF NOT EXISTS avisos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  corpo TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  autor TEXT,
  alvo TEXT NOT NULL DEFAULT 'todos',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS avisos_lidos (
  aviso_id UUID NOT NULL REFERENCES avisos(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  PRIMARY KEY (aviso_id, aluno_id)
);

CREATE TABLE IF NOT EXISTS trilha (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL CHECK (tipo IN ('faixa','grau')),
  de TEXT,
  para TEXT,
  obs TEXT
);

CREATE TABLE IF NOT EXISTS certificados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  token TEXT UNIQUE NOT NULL,
  emissor TEXT
);

CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos (data);
CREATE INDEX IF NOT EXISTS idx_presencas_data ON presencas (data);
CREATE INDEX IF NOT EXISTS idx_mensalidades_status ON mensalidades (status);
CREATE INDEX IF NOT EXISTS idx_bilhetes_rifa ON bilhetes (rifa_id);
CREATE INDEX IF NOT EXISTS idx_trilha_aluno ON trilha (aluno_id);