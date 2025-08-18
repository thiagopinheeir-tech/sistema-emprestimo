-- ===================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Sistema de Empréstimos - Supabase
-- ===================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emprestimos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- POLÍTICAS PARA TABELA: usuarios
-- ===================================================================

-- Administradores podem ver todos os usuários
CREATE POLICY "Admins can view all users" ON public.usuarios
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios u 
            WHERE u.id = auth.uid() AND u.nivel = 'administrador' AND u.ativo = true
        )
    );

-- Gerentes podem ver seus subordinados
CREATE POLICY "Managers can view subordinates" ON public.usuarios
    FOR SELECT TO authenticated  
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.id = auth.uid() AND u.nivel = 'gerente' AND u.ativo = true
        ) AND (
            superior_id = auth.uid() OR id = auth.uid()
        )
    );

-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.usuarios
    FOR SELECT TO authenticated
    USING (id = auth.uid());

-- Apenas admins podem inserir novos usuários
CREATE POLICY "Only admins can insert users" ON public.usuarios
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.id = auth.uid() AND u.nivel = 'administrador' AND u.ativo = true
        )
    );

-- Admins podem atualizar qualquer usuário
CREATE POLICY "Admins can update all users" ON public.usuarios
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.id = auth.uid() AND u.nivel = 'administrador' AND u.ativo = true
        )
    );

-- Usuários podem atualizar seu próprio perfil (exceto nível e hierarquia)
CREATE POLICY "Users can update own profile" ON public.usuarios
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() AND 
        nivel = (SELECT nivel FROM public.usuarios WHERE id = auth.uid()) AND
        hierarquia = (SELECT hierarquia FROM public.usuarios WHERE id = auth.uid())
    );

-- ===================================================================
-- POLÍTICAS PARA TABELA: clientes
-- ===================================================================

-- Administradores podem ver todos os clientes
CREATE POLICY "Admins can view all clients" ON public.clientes
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.id = auth.uid() AND u.nivel = 'administrador' AND u.ativo = true
        )
    );

-- Gerentes podem ver clientes de seus subordinados
CREATE POLICY "Managers can view subordinate clients" ON public.clientes
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.id = auth.uid() AND u.nivel = 'gerente' AND u.ativo = true
        ) AND (
            responsavel_id = auth.uid() OR
            responsavel_id IN (
                SELECT id FROM public.usuarios 
                WHERE superior_id = auth.uid() AND ativo = true
            )
        )
    );

-- Operadores podem ver apenas seus próprios clientes
CREATE POLICY "Operators can view own clients" ON public.clientes
    FOR SELECT TO authenticated
    USING (responsavel_id = auth.uid());

-- Admins e gerentes podem inserir clientes
CREATE POLICY "Admins and managers can insert clients" ON public.clientes
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.id = auth.uid() AND u.nivel IN ('administrador', 'gerente') AND u.ativo = true
        )
    );

-- Operadores podem inserir clientes para si mesmos
CREATE POLICY "Operators can insert own clients" ON public.clientes
    FOR INSERT TO authenticated
    WITH CHECK (responsavel_id = auth.uid());

-- Controle de atualização similar ao SELECT
CREATE POLICY "Update clients based on hierarchy" ON public.clientes
    FOR UPDATE TO authenticated
    USING (
        -- Admin pode tudo
        EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.id = auth.uid() AND u.nivel = 'administrador' AND u.ativo = true
        ) OR
        -- Gerente pode editar clientes de subordinados
        (
            EXISTS (
                SELECT 1 FROM public.usuarios u
                WHERE u.id = auth.uid() AND u.nivel = 'gerente' AND u.ativo = true
            ) AND (
                responsavel_id = auth.uid() OR
                responsavel_id IN (
                    SELECT id FROM public.usuarios 
                    WHERE superior_id = auth.uid() AND ativo = true
                )
            )
        ) OR
        -- Operador pode editar apenas seus clientes
        responsavel_id = auth.uid()
    );

-- ===================================================================
-- POLÍTICAS PARA TABELA: emprestimos
-- ===================================================================

-- Políticas similares aos clientes, mas com JOIN
CREATE POLICY "View loans based on hierarchy" ON public.emprestimos
    FOR SELECT TO authenticated
    USING (
        -- Admin vê tudo
        EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.id = auth.uid() AND u.nivel = 'administrador' AND u.ativo = true
        ) OR
        -- Gerente vê empréstimos de clientes de subordinados
        (
            EXISTS (
                SELECT 1 FROM public.usuarios u
                WHERE u.id = auth.uid() AND u.nivel = 'gerente' AND u.ativo = true
            ) AND (
                responsavel_id = auth.uid() OR
                cliente_id IN (
                    SELECT c.id FROM public.clientes c
                    WHERE c.responsavel_id = auth.uid() OR
                          c.responsavel_id IN (
                              SELECT id FROM public.usuarios 
                              WHERE superior_id = auth.uid() AND ativo = true
                          )
                )
            )
        ) OR
        -- Operador vê apenas empréstimos de seus clientes
        cliente_id IN (
            SELECT id FROM public.clientes 
            WHERE responsavel_id = auth.uid()
        )
    );

-- Insert de empréstimos
CREATE POLICY "Insert loans based on client ownership" ON public.emprestimos
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Só pode criar empréstimo para clientes que pode ver
        cliente_id IN (
            SELECT c.id FROM public.clientes c
            WHERE 
                -- Admin pode tudo
                EXISTS (
                    SELECT 1 FROM public.usuarios u
                    WHERE u.id = auth.uid() AND u.nivel = 'administrador' AND u.ativo = true
                ) OR
                -- Gerente pode para clientes de subordinados
                (
                    EXISTS (
                        SELECT 1 FROM public.usuarios u
                        WHERE u.id = auth.uid() AND u.nivel = 'gerente' AND u.ativo = true
                    ) AND (
                        c.responsavel_id = auth.uid() OR
                        c.responsavel_id IN (
                            SELECT id FROM public.usuarios 
                            WHERE superior_id = auth.uid() AND ativo = true
                        )
                    )
                ) OR
                -- Operador para seus clientes
                c.responsavel_id = auth.uid()
        )
    );

-- Update de empréstimos (mesma lógica do SELECT)
CREATE POLICY "Update loans based on hierarchy" ON public.emprestimos
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios u
            WHERE u.id = auth.uid() AND u.nivel = 'administrador' AND u.ativo = true
        ) OR
        (
            EXISTS (
                SELECT 1 FROM public.usuarios u
                WHERE u.id = auth.uid() AND u.nivel = 'gerente' AND u.ativo = true
            ) AND (
                responsavel_id = auth.uid() OR
                cliente_id IN (
                    SELECT c.id FROM public.clientes c
                    WHERE c.responsavel_id = auth.uid() OR
                          c.responsavel_id IN (
                              SELECT id FROM public.usuarios 
                              WHERE superior_id = auth.uid() AND ativo = true
                          )
                )
            )
        ) OR
        cliente_id IN (
            SELECT id FROM public.clientes 
            WHERE responsavel_id = auth.uid()
        )
    );

-- ===================================================================
-- POLÍTICAS PARA TABELA: pagamentos
-- ===================================================================

-- Pagamentos seguem a mesma hierarquia dos empréstimos
CREATE POLICY "View payments based on loan access" ON public.pagamentos
    FOR SELECT TO authenticated
    USING (
        emprestimo_id IN (
            SELECT e.id FROM public.emprestimos e
            WHERE 
                -- Admin vê tudo
                EXISTS (
                    SELECT 1 FROM public.usuarios u
                    WHERE u.id = auth.uid() AND u.nivel = 'administrador' AND u.ativo = true
                ) OR
                -- Gerente vê pagamentos de empréstimos de subordinados
                (
                    EXISTS (
                        SELECT 1 FROM public.usuarios u
                        WHERE u.id = auth.uid() AND u.nivel = 'gerente' AND u.ativo = true
                    ) AND (
                        e.responsavel_id = auth.uid() OR
                        e.cliente_id IN (
                            SELECT c.id FROM public.clientes c
                            WHERE c.responsavel_id = auth.uid() OR
                                  c.responsavel_id IN (
                                      SELECT id FROM public.usuarios 
                                      WHERE superior_id = auth.uid() AND ativo = true
                                  )
                        )
                    )
                ) OR
                -- Operador vê pagamentos de empréstimos de seus clientes
                e.cliente_id IN (
                    SELECT id FROM public.clientes 
                    WHERE responsavel_id = auth.uid()
                )
        )
    );

-- Insert de pagamentos
CREATE POLICY "Insert payments for accessible loans" ON public.pagamentos
    FOR INSERT TO authenticated
    WITH CHECK (
        emprestimo_id IN (
            SELECT e.id FROM public.emprestimos e
            JOIN public.clientes c ON e.cliente_id = c.id
            WHERE 
                EXISTS (
                    SELECT 1 FROM public.usuarios u
                    WHERE u.id = auth.uid() AND u.nivel = 'administrador' AND u.ativo = true
                ) OR
                (
                    EXISTS (
                        SELECT 1 FROM public.usuarios u
                        WHERE u.id = auth.uid() AND u.nivel = 'gerente' AND u.ativo = true
                    ) AND (
                        c.responsavel_id = auth.uid() OR
                        c.responsavel_id IN (
                            SELECT id FROM public.usuarios 
                            WHERE superior_id = auth.uid() AND ativo = true
                        )
                    )
                ) OR
                c.responsavel_id = auth.uid()
        )
    );

-- ===================================================================
-- POLÍTICAS PARA VIEWS (apenas SELECT)
-- ===================================================================

-- Views herdam automaticamente as políticas das tabelas base
-- mas podemos criar políticas específicas se necessário

-- Política para emprestimos_detalhados
CREATE POLICY "View detailed loans based on access" ON public.emprestimos_detalhados
    FOR SELECT TO authenticated
    USING (
        id IN (
            SELECT e.id FROM public.emprestimos e
            -- Reutiliza a lógica da tabela emprestimos
        )
    );