-- SQL para criar todas as tabelas no Supabase
-- Execute este script no SQL Editor do Supabase

-- Limpar tabelas existentes (cuidado: remove todos os dados!)
DROP TABLE IF EXISTS historico_pagamentos;
DROP TABLE IF EXISTS emprestimos;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS usuarios;

-- Criar tabela de usuários
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'operator')),
  gerente_id UUID REFERENCES usuarios(id),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  contato TEXT,
  documento TEXT,
  dataNascimento DATE,
  endereco TEXT,
  foto TEXT,
  observacoes TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  responsavel_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de empréstimos
CREATE TABLE emprestimos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clienteId UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  valorPrincipal NUMERIC(12, 2) NOT NULL CHECK (valorPrincipal > 0),
  jurosPerc NUMERIC(5, 2) NOT NULL CHECK (jurosPerc >= 0),
  dataInicio DATE NOT NULL,
  observacoes TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'quitado', 'cancelado')),
  responsavel_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de histórico de pagamentos
CREATE TABLE historico_pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emprestimo_id UUID NOT NULL REFERENCES emprestimos(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  valor NUMERIC(12, 2) NOT NULL CHECK (valor > 0),
  tipo TEXT NOT NULL CHECK (tipo IN ('juros', 'quitacao', 'parcial')),
  dataPagamento DATE DEFAULT CURRENT_DATE,
  observacoes TEXT,
  responsavel_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_role ON usuarios(role);
CREATE INDEX idx_usuarios_gerente ON usuarios(gerente_id);

CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_clientes_status ON clientes(status);
CREATE INDEX idx_clientes_responsavel ON clientes(responsavel_id);

CREATE INDEX idx_emprestimos_cliente ON emprestimos(clienteId);
CREATE INDEX idx_emprestimos_status ON emprestimos(status);
CREATE INDEX idx_emprestimos_data ON emprestimos(dataInicio);
CREATE INDEX idx_emprestimos_responsavel ON emprestimos(responsavel_id);

CREATE INDEX idx_historico_emprestimo ON historico_pagamentos(emprestimo_id);
CREATE INDEX idx_historico_cliente ON historico_pagamentos(cliente_id);
CREATE INDEX idx_historico_tipo ON historico_pagamentos(tipo);
CREATE INDEX idx_historico_data ON historico_pagamentos(dataPagamento);

-- Inserir usuários iniciais
INSERT INTO usuarios (username, password, name, role, status) VALUES 
('admin', '123456', 'Administrador do Sistema', 'admin', 'ativo'),
('gerente', '123456', 'Gerente Financeiro', 'manager', 'ativo');

-- Inserir um operador vinculado ao gerente (substitua o UUID pelo valor real do gerente)
INSERT INTO usuarios (username, password, name, role, gerente_id, status)
SELECT 'operador', '123456', 'Operador', 'operator', id, 'ativo'
FROM usuarios WHERE username = 'gerente';

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emprestimos_updated_at BEFORE UPDATE ON emprestimos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_historico_updated_at BEFORE UPDATE ON historico_pagamentos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security) se necessário
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE emprestimos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_pagamentos ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de segurança (ajuste conforme necessário)
CREATE POLICY "Usuários podem ver todos os dados" ON usuarios FOR ALL USING (true);
CREATE POLICY "Clientes podem ser vistos por todos" ON clientes FOR ALL USING (true);
CREATE POLICY "Empréstimos podem ser vistos por todos" ON emprestimos FOR ALL USING (true);
CREATE POLICY "Histórico pode ser visto por todos" ON historico_pagamentos FOR ALL USING (true);

-- Inserir alguns dados de exemplo (opcional)
-- Descomente as linhas abaixo se quiser dados de teste

/*
-- Inserir clientes de exemplo
INSERT INTO clientes (nome, contato, documento, status, responsavel_id)
SELECT 
  'Maria Silva', 
  '(11) 99999-1111', 
  '123.456.789-01', 
  'ativo',
  id
FROM usuarios WHERE username = 'operador';

INSERT INTO clientes (nome, contato, documento, status, responsavel_id)
SELECT 
  'João Santos', 
  '(11) 88888-2222', 
  '987.654.321-02', 
  'ativo',
  id
FROM usuarios WHERE username = 'operador';

-- Inserir empréstimos de exemplo
INSERT INTO emprestimos (clienteId, valorPrincipal, jurosPerc, dataInicio, status, responsavel_id)
SELECT 
  c.id,
  5000.00,
  10.0,
  CURRENT_DATE - INTERVAL '30 days',
  'ativo',
  u.id
FROM clientes c, usuarios u 
WHERE c.nome = 'Maria Silva' AND u.username = 'operador';

-- Inserir histórico de exemplo
INSERT INTO historico_pagamentos (emprestimo_id, cliente_id, valor, tipo, dataPagamento, responsavel_id)
SELECT 
  e.id,
  e.clienteId,
  500.00,
  'juros',
  CURRENT_DATE - INTERVAL '15 days',
  e.responsavel_id
FROM emprestimos e
JOIN clientes c ON e.clienteId = c.id
WHERE c.nome = 'Maria Silva';
*/

-- Verificar se tudo foi criado corretamente
SELECT 'Usuários criados:' as info, count(*) as total FROM usuarios
UNION ALL
SELECT 'Clientes criados:', count(*) FROM clientes
UNION ALL  
SELECT 'Empréstimos criados:', count(*) FROM emprestimos
UNION ALL
SELECT 'Histórico criado:', count(*) FROM historico_pagamentos;