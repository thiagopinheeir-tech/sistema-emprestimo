-- ===================================================================
-- DADOS INICIAIS (SEED) - Sistema de Empréstimos
-- ===================================================================

-- Inserir usuários iniciais
INSERT INTO public.usuarios (id, username, password_hash, nome, nivel, ativo, hierarquia, superior_id) VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'admin',
        '$2b$10$rQ8QzM3O7e8JjxKx2O7Q8e8QzM3O7e8JjxKx2O7Q8e8QzM3O7e8J', -- senha: 123456
        'Administrador do Sistema',
        'administrador',
        true,
        9,
        NULL
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'gerente',
        '$2b$10$rQ8QzM3O7e8JjxKx2O7Q8e8QzM3O7e8JjxKx2O7Q8e8QzM3O7e8J', -- senha: 123456
        'João Silva',
        'gerente',
        true,
        4,
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'operador',
        '$2b$10$rQ8QzM3O7e8JjxKx2O7Q8e8QzM3O7e8JjxKx2O7Q8e8QzM3O7e8J', -- senha: 123456
        'Maria Santos',
        'operador',
        true,
        1,
        '00000000-0000-0000-0000-000000000002'
    ),
    (
        '00000000-0000-0000-0000-000000000004',
        'operador2',
        '$2b$10$rQ8QzM3O7e8JjxKx2O7Q8e8QzM3O7e8JjxKx2O7Q8e8QzM3O7e8J', -- senha: 123456
        'Carlos Oliveira',
        'operador',
        true,
        1,
        '00000000-0000-0000-0000-000000000002'
    );

-- Inserir clientes exemplo
INSERT INTO public.clientes (id, nome, cpf, contato, endereco, data_nascimento, observacoes, status, responsavel_id) VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'Carlos Eduardo Silva',
        '123.456.789-00',
        '(11) 99999-1111',
        'Rua das Flores, 123 - Vila Mariana - São Paulo/SP - CEP: 04001-000',
        '1985-03-15',
        'Cliente regular, sempre pontual nos pagamentos. Histórico limpo.',
        'ativo',
        '00000000-0000-0000-0000-000000000003'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'Ana Paula Costa',
        '987.654.321-00',
        '(11) 88888-2222',
        'Av. Paulista, 456 - Bela Vista - São Paulo/SP - CEP: 01310-100',
        '1990-07-20',
        'Boa pagadora, trabalha em empresa multinacional. Renda comprovada.',
        'ativo',
        '00000000-0000-0000-0000-000000000003'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'Roberto Mendes',
        '456.789.123-00',
        '(11) 77777-3333',
        'Rua da Paz, 789 - Moema - São Paulo/SP - CEP: 04567-890',
        '1978-11-05',
        'Cliente antigo da empresa, relacionamento de 5 anos.',
        'ativo',
        '00000000-0000-0000-0000-000000000004'
    ),
    (
        '10000000-0000-0000-0000-000000000004',
        'Fernanda Oliveira',
        '789.123.456-00',
        '(11) 66666-4444',
        'Alameda Santos, 321 - Cerqueira César - São Paulo/SP - CEP: 01419-000',
        '1992-12-10',
        'Nova cliente, primeira operação. Documentação completa.',
        'ativo',
        '00000000-0000-0000-0000-000000000003'
    ),
    (
        '10000000-0000-0000-0000-000000000005',
        'Pedro Almeida',
        '321.654.987-00',
        '(11) 55555-5555',
        'Rua Oscar Freire, 654 - Jardins - São Paulo/SP - CEP: 01426-001',
        '1980-05-25',
        'Cliente VIP, alto valor patrimonial. Preferência de atendimento.',
        'ativo',
        '00000000-0000-0000-0000-000000000004'
    ),
    (
        '10000000-0000-0000-0000-000000000006',
        'Juliana Rocha',
        '654.321.987-00',
        '(11) 44444-6666',
        'Av. Brigadeiro Faria Lima, 987 - Pinheiros - São Paulo/SP - CEP: 05426-200',
        '1988-09-18',
        'Empresária, possui negócio próprio. Boa capacidade de pagamento.',
        'ativo',
        '00000000-0000-0000-0000-000000000003'
    );

-- Inserir empréstimos exemplo
INSERT INTO public.emprestimos (id, cliente_id, valor, taxa_juros, data_emprestimo, data_vencimento, status, valor_pago, data_quitacao, responsavel_id, observacoes) VALUES
    (
        '20000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        5000.00,
        0.05, -- 5% ao mês
        '2024-07-01',
        '2024-08-01',
        'ativo',
        250.00,
        NULL,
        '00000000-0000-0000-0000-000000000003',
        'Empréstimo para capital de giro'
    ),
    (
        '20000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000002',
        3000.00,
        0.04, -- 4% ao mês
        '2024-06-15',
        '2024-07-15',
        'quitado',
        3120.00,
        '2024-07-10',
        '00000000-0000-0000-0000-000000000003',
        'Empréstimo pessoal para emergência médica'
    ),
    (
        '20000000-0000-0000-0000-000000000003',
        '10000000-0000-0000-0000-000000000003',
        8000.00,
        0.06, -- 6% ao mês
        '2024-05-20',
        '2024-06-20',
        'ativo',
        1440.00,
        NULL,
        '00000000-0000-0000-0000-000000000004',
        'Empréstimo para reforma residencial'
    ),
    (
        '20000000-0000-0000-0000-000000000004',
        '10000000-0000-0000-0000-000000000004',
        2500.00,
        0.045, -- 4.5% ao mês
        '2024-07-15',
        '2024-08-15',
        'ativo',
        0.00,
        NULL,
        '00000000-0000-0000-0000-000000000003',
        'Primeiro empréstimo da cliente'
    ),
    (
        '20000000-0000-0000-0000-000000000005',
        '10000000-0000-0000-0000-000000000005',
        10000.00,
        0.07, -- 7% ao mês
        '2024-06-01',
        '2024-07-01',
        'ativo',
        1400.00,
        NULL,
        '00000000-0000-0000-0000-000000000004',
        'Empréstimo para investimento em negócio'
    ),
    (
        '20000000-0000-0000-0000-000000000006',
        '10000000-0000-0000-0000-000000000006',
        4500.00,
        0.055, -- 5.5% ao mês
        '2024-07-10',
        '2024-08-10',
        'ativo',
        247.50,
        NULL,
        '00000000-0000-0000-0000-000000000003',
        'Empréstimo para expansão do negócio'
    );

-- Inserir histórico de pagamentos
INSERT INTO public.pagamentos (id, emprestimo_id, valor, data_pagamento, tipo, observacoes) VALUES
    (
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        250.00,
        '2024-08-01',
        'juros',
        'Pagamento mensal de juros - 1º mês'
    ),
    (
        '30000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000002',
        120.00,
        '2024-06-15',
        'juros',
        'Pagamento de juros - Mês 1'
    ),
    (
        '30000000-0000-0000-0000-000000000003',
        '20000000-0000-0000-0000-000000000002',
        3000.00,
        '2024-07-10',
        'quitacao',
        'Quitação total do empréstimo'
    ),
    (
        '30000000-0000-0000-0000-000000000004',
        '20000000-0000-0000-0000-000000000003',
        480.00,
        '2024-06-20',
        'juros',
        'Pagamento de juros - Mês 1'
    ),
    (
        '30000000-0000-0000-0000-000000000005',
        '20000000-0000-0000-0000-000000000003',
        480.00,
        '2024-07-20',
        'juros',
        'Pagamento de juros - Mês 2'
    ),
    (
        '30000000-0000-0000-0000-000000000006',
        '20000000-0000-0000-0000-000000000003',
        480.00,
        '2024-08-20',
        'juros',
        'Pagamento de juros - Mês 3'
    ),
    (
        '30000000-0000-0000-0000-000000000007',
        '20000000-0000-0000-0000-000000000005',
        700.00,
        '2024-07-01',
        'juros',
        'Pagamento de juros - Mês 1'
    ),
    (
        '30000000-0000-0000-0000-000000000008',
        '20000000-0000-0000-0000-000000000005',
        700.00,
        '2024-08-01',
        'juros',
        'Pagamento de juros - Mês 2'
    ),
    (
        '30000000-0000-0000-0000-000000000009',
        '20000000-0000-0000-0000-000000000006',
        247.50,
        '2024-08-10',
        'juros',
        'Pagamento de juros - Mês 1'
    );

-- Atualizar as sequences para IDs futuros
-- (Se usar UUIDs, isso não é necessário, mas mantemos para referência)

-- Verificar dados inseridos
SELECT 'Usuários inseridos:' as tabela, COUNT(*) as total FROM public.usuarios
UNION ALL
SELECT 'Clientes inseridos:', COUNT(*) FROM public.clientes  
UNION ALL
SELECT 'Empréstimos inseridos:', COUNT(*) FROM public.emprestimos
UNION ALL
SELECT 'Pagamentos inseridos:', COUNT(*) FROM public.pagamentos;