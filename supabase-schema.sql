-- ===================================================================
-- SISTEMA DE EMPRÉSTIMOS - ESTRUTURA SUPABASE
-- ===================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- TABELA: usuarios
-- ===================================================================
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    nivel VARCHAR(20) CHECK (nivel IN ('administrador', 'gerente', 'operador')) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    hierarquia INTEGER NOT NULL,
    superior_id UUID REFERENCES public.usuarios(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para usuarios
CREATE INDEX idx_usuarios_username ON public.usuarios(username);
CREATE INDEX idx_usuarios_nivel ON public.usuarios(nivel);
CREATE INDEX idx_usuarios_superior ON public.usuarios(superior_id);

-- ===================================================================
-- TABELA: clientes  
-- ===================================================================
CREATE TABLE public.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    contato VARCHAR(20) NOT NULL,
    endereco TEXT NOT NULL,
    data_nascimento DATE NOT NULL,
    observacoes TEXT,
    status VARCHAR(10) CHECK (status IN ('ativo', 'inativo')) DEFAULT 'ativo',
    foto TEXT, -- Base64 encoded
    responsavel_id UUID NOT NULL REFERENCES public.usuarios(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para clientes
CREATE INDEX idx_clientes_cpf ON public.clientes(cpf);
CREATE INDEX idx_clientes_nome ON public.clientes(nome);
CREATE INDEX idx_clientes_responsavel ON public.clientes(responsavel_id);
CREATE INDEX idx_clientes_status ON public.clientes(status);

-- ===================================================================
-- TABELA: emprestimos
-- ===================================================================
CREATE TABLE public.emprestimos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    valor DECIMAL(15,2) NOT NULL CHECK (valor > 0),
    taxa_juros DECIMAL(5,4) NOT NULL CHECK (taxa_juros > 0), -- Ex: 0.05 = 5%
    data_emprestimo DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    status VARCHAR(10) CHECK (status IN ('ativo', 'quitado')) DEFAULT 'ativo',
    valor_pago DECIMAL(15,2) DEFAULT 0,
    data_quitacao DATE,
    responsavel_id UUID NOT NULL REFERENCES public.usuarios(id),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para emprestimos
CREATE INDEX idx_emprestimos_cliente ON public.emprestimos(cliente_id);
CREATE INDEX idx_emprestimos_status ON public.emprestimos(status);
CREATE INDEX idx_emprestimos_responsavel ON public.emprestimos(responsavel_id);
CREATE INDEX idx_emprestimos_vencimento ON public.emprestimos(data_vencimento);

-- ===================================================================
-- TABELA: pagamentos
-- ===================================================================
CREATE TABLE public.pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emprestimo_id UUID NOT NULL REFERENCES public.emprestimos(id) ON DELETE CASCADE,
    valor DECIMAL(15,2) NOT NULL CHECK (valor > 0),
    data_pagamento DATE NOT NULL,
    tipo VARCHAR(10) CHECK (tipo IN ('juros', 'quitacao')) NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para pagamentos
CREATE INDEX idx_pagamentos_emprestimo ON public.pagamentos(emprestimo_id);
CREATE INDEX idx_pagamentos_data ON public.pagamentos(data_pagamento);
CREATE INDEX idx_pagamentos_tipo ON public.pagamentos(tipo);

-- ===================================================================
-- TRIGGERS PARA UPDATED_AT
-- ===================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para tabelas
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emprestimos_updated_at BEFORE UPDATE ON public.emprestimos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- VIEWS PARA RELATÓRIOS
-- ===================================================================

-- View: emprestimos_detalhados
CREATE VIEW public.emprestimos_detalhados AS
SELECT 
    e.id,
    e.valor,
    e.taxa_juros,
    e.data_emprestimo,
    e.data_vencimento,
    e.status,
    e.valor_pago,
    e.data_quitacao,
    c.nome as cliente_nome,
    c.cpf as cliente_cpf,
    c.contato as cliente_contato,
    u.nome as responsavel_nome,
    e.created_at
FROM public.emprestimos e
JOIN public.clientes c ON e.cliente_id = c.id
JOIN public.usuarios u ON e.responsavel_id = u.id;

-- View: pagamentos_detalhados
CREATE VIEW public.pagamentos_detalhados AS
SELECT 
    p.id,
    p.valor,
    p.data_pagamento,
    p.tipo,
    p.observacoes,
    e.valor as emprestimo_valor,
    c.nome as cliente_nome,
    c.cpf as cliente_cpf,
    u.nome as responsavel_nome,
    p.created_at
FROM public.pagamentos p
JOIN public.emprestimos e ON p.emprestimo_id = e.id
JOIN public.clientes c ON e.cliente_id = c.id
JOIN public.usuarios u ON e.responsavel_id = u.id;

-- View: dashboard_metricas
CREATE VIEW public.dashboard_metricas AS
SELECT 
    COUNT(DISTINCT c.id) as total_clientes_ativos,
    COUNT(DISTINCT CASE WHEN e.status = 'ativo' THEN e.id END) as emprestimos_ativos,
    COUNT(DISTINCT CASE WHEN e.status = 'quitado' THEN e.id END) as emprestimos_quitados,
    COALESCE(SUM(CASE WHEN e.status = 'ativo' THEN e.valor END), 0) as valor_total_ativo,
    COALESCE(SUM(p.valor), 0) as total_recebido,
    COALESCE(SUM(CASE WHEN p.tipo = 'juros' THEN p.valor END), 0) as total_juros_recebidos
FROM public.clientes c
LEFT JOIN public.emprestimos e ON c.id = e.cliente_id
LEFT JOIN public.pagamentos p ON e.id = p.emprestimo_id
WHERE c.status = 'ativo';

-- ===================================================================
-- FUNÇÕES AUXILIARES
-- ===================================================================

-- Função: calcular_dias_atraso
CREATE OR REPLACE FUNCTION public.calcular_dias_atraso(data_vencimento DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN GREATEST(0, EXTRACT(DAY FROM (CURRENT_DATE - data_vencimento))::INTEGER);
END;
$$ LANGUAGE plpgsql;

-- Função: calcular_multa
CREATE OR REPLACE FUNCTION public.calcular_multa(valor_original DECIMAL, data_vencimento DATE, taxa_multa DECIMAL DEFAULT 0.02)
RETURNS DECIMAL AS $$
DECLARE
    dias_atraso INTEGER;
BEGIN
    dias_atraso := public.calcular_dias_atraso(data_vencimento);
    IF dias_atraso > 0 THEN
        RETURN valor_original * taxa_multa * dias_atraso;
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Função: get_user_role (para RLS)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        current_setting('request.jwt.claims', true)::json->>'user_role',
        'anon'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: get_user_id (para RLS)
CREATE OR REPLACE FUNCTION public.get_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        (current_setting('request.jwt.claims', true)::json->>'user_id')::UUID,
        auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;