// ===================================================================
// SISTEMA DE EMPRÉSTIMOS - INTEGRAÇÃO SUPABASE
// ===================================================================

// Configuração do Supabase
const SUPABASE_URL = 'https://wayoouqdbwkvjpmlozvu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndheW9vdXFkYndrdmpwbWxvenZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0Njg3NjcsImV4cCI6MjA3MTA0NDc2N30.ekjLA2vn9XbSez8B2fJ_2ZuairSWHzRzHcNlcd43KYc';

// Importar Supabase (via CDN)
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

class SistemaEmprestimosSupabase {
    constructor() {
        // Inicializar cliente Supabase
        this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Estado da aplicação
        this.usuarioLogado = null;
        this.paginaAtual = 'dashboard';

        // Cache de dados
        this.cache = {
            usuarios: [],
            clientes: [],
            emprestimos: [],
            pagamentos: []
        };

        // Inicializar app
        this.init();
    }

    // ===================================================================
    // INICIALIZAÇÃO
    // ===================================================================

    async init() {
        try {
            // Verificar se usuário já está logado
            const { data: { session } } = await this.supabase.auth.getSession();

            if (session) {
                await this.loadUserProfile(session.user.id);
                this.showApp();
            } else {
                this.showLogin();
            }

            // Listener para mudanças de autenticação
            this.supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    this.loadUserProfile(session.user.id);
                    this.showApp();
                } else if (event === 'SIGNED_OUT') {
                    this.usuarioLogado = null;
                    this.showLogin();
                }
            });

            // Event listeners
            this.setupEventListeners();

        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.mostrarNotificacao('Erro ao inicializar aplicação', 'error');
        }
    }

    // ===================================================================
    // AUTENTICAÇÃO
    // ===================================================================

    async login(username, password) {
        try {
            // Como o Supabase usa email, vamos mapear username para email
            const email = `${username}@sistema.local`;

            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                // Se não existe, tentar criar conta
                if (error.message.includes('Invalid login credentials')) {
                    // Buscar usuário na tabela usuarios
                    const { data: userData } = await this.supabase
                        .from('usuarios')
                        .select('*')
                        .eq('username', username)
                        .eq('password_hash', this.hashPassword(password))
                        .single();

                    if (userData) {
                        // Criar conta no Auth do Supabase
                        const { data: authData, error: signUpError } = await this.supabase.auth.signUp({
                            email: email,
                            password: password,
                            options: {
                                data: {
                                    user_id: userData.id,
                                    username: userData.username,
                                    nome: userData.nome,
                                    nivel: userData.nivel
                                }
                            }
                        });

                        if (signUpError) throw signUpError;

                        this.usuarioLogado = userData;
                        return true;
                    }
                }
                throw error;
            }

            await this.loadUserProfile(data.user.id);
            return true;

        } catch (error) {
            console.error('Erro no login:', error);
            this.mostrarNotificacao('Credenciais inválidas', 'error');
            return false;
        }
    }

    async loadUserProfile(authUserId) {
        try {
            // Buscar dados do usuário na tabela usuarios
            const { data, error } = await this.supabase
                .from('usuarios')
                .select('*')
                .eq('id', authUserId)
                .single();

            if (error) throw error;

            this.usuarioLogado = data;

        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            // Fallback: usar dados do auth metadata
            const { data: { user } } = await this.supabase.auth.getUser();
            if (user?.user_metadata) {
                this.usuarioLogado = {
                    id: user.user_metadata.user_id,
                    username: user.user_metadata.username,
                    nome: user.user_metadata.nome,
                    nivel: user.user_metadata.nivel
                };
            }
        }
    }

    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;

            this.usuarioLogado = null;
            this.cache = { usuarios: [], clientes: [], emprestimos: [], pagamentos: [] };
            this.showLogin();

        } catch (error) {
            console.error('Erro no logout:', error);
            this.mostrarNotificacao('Erro ao fazer logout', 'error');
        }
    }

    // ===================================================================
    // OPERAÇÕES DE DADOS
    // ===================================================================

    // CLIENTES
    async carregarClientes() {
        try {
            const { data, error } = await this.supabase
                .from('clientes')
                .select(`
                    *,
                    responsavel:responsavel_id(nome)
                `)
                .eq('status', 'ativo')
                .order('nome');

            if (error) throw error;

            this.cache.clientes = data;
            return data;

        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            this.mostrarNotificacao('Erro ao carregar clientes', 'error');
            return [];
        }
    }

    async adicionarCliente(dadosCliente) {
        try {
            const clienteData = {
                ...dadosCliente,
                responsavel_id: this.usuarioLogado.id,
                created_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('clientes')
                .insert([clienteData])
                .select()
                .single();

            if (error) throw error;

            this.cache.clientes.push(data);
            this.mostrarNotificacao('Cliente adicionado com sucesso!', 'success');
            return data;

        } catch (error) {
            console.error('Erro ao adicionar cliente:', error);
            this.mostrarNotificacao('Erro ao adicionar cliente', 'error');
            throw error;
        }
    }

    async atualizarCliente(id, dadosCliente) {
        try {
            const { data, error } = await this.supabase
                .from('clientes')
                .update({
                    ...dadosCliente,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Atualizar cache
            const index = this.cache.clientes.findIndex(c => c.id === id);
            if (index !== -1) {
                this.cache.clientes[index] = data;
            }

            this.mostrarNotificacao('Cliente atualizado com sucesso!', 'success');
            return data;

        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            this.mostrarNotificacao('Erro ao atualizar cliente', 'error');
            throw error;
        }
    }

    // EMPRÉSTIMOS
    async carregarEmprestimos() {
        try {
            const { data, error } = await this.supabase
                .from('emprestimos_detalhados')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.cache.emprestimos = data;
            return data;

        } catch (error) {
            console.error('Erro ao carregar empréstimos:', error);
            this.mostrarNotificacao('Erro ao carregar empréstimos', 'error');
            return [];
        }
    }

    async criarEmprestimo(dadosEmprestimo) {
        try {
            const emprestimoData = {
                ...dadosEmprestimo,
                responsavel_id: this.usuarioLogado.id,
                status: 'ativo',
                valor_pago: 0
            };

            const { data, error } = await this.supabase
                .from('emprestimos')
                .insert([emprestimoData])
                .select()
                .single();

            if (error) throw error;

            this.mostrarNotificacao('Empréstimo criado com sucesso!', 'success');
            await this.carregarEmprestimos(); // Recarregar lista
            return data;

        } catch (error) {
            console.error('Erro ao criar empréstimo:', error);
            this.mostrarNotificacao('Erro ao criar empréstimo', 'error');
            throw error;
        }
    }

    async pagarJuros(emprestimoId) {
        try {
            // Buscar dados do empréstimo
            const { data: emprestimo, error: emprestimoError } = await this.supabase
                .from('emprestimos')
                .select('*')
                .eq('id', emprestimoId)
                .single();

            if (emprestimoError) throw emprestimoError;

            if (emprestimo.status !== 'ativo') {
                throw new Error('Empréstimo já foi quitado');
            }

            // Calcular juros
            const valorJuros = emprestimo.valor * emprestimo.taxa_juros;

            // Confirmar pagamento
            if (!confirm(`Confirma pagamento de juros no valor de R$ ${valorJuros.toFixed(2)}?`)) {
                return;
            }

            // Registrar pagamento
            const { error: pagamentoError } = await this.supabase
                .from('pagamentos')
                .insert([{
                    emprestimo_id: emprestimoId,
                    valor: valorJuros,
                    data_pagamento: new Date().toISOString().split('T')[0],
                    tipo: 'juros',
                    observacoes: 'Pagamento mensal de juros'
                }]);

            if (pagamentoError) throw pagamentoError;

            // Atualizar valor pago no empréstimo
            const { error: updateError } = await this.supabase
                .from('emprestimos')
                .update({
                    valor_pago: emprestimo.valor_pago + valorJuros
                })
                .eq('id', emprestimoId);

            if (updateError) throw updateError;

            this.mostrarNotificacao('Juros pagos com sucesso!', 'success');
            await this.carregarEmprestimos();

        } catch (error) {
            console.error('Erro ao pagar juros:', error);
            this.mostrarNotificacao(error.message, 'error');
        }
    }

    async quitarEmprestimo(emprestimoId) {
        try {
            // Buscar dados do empréstimo
            const { data: emprestimo } = await this.supabase
                .from('emprestimos')
                .select('*')
                .eq('id', emprestimoId)
                .single();

            if (!emprestimo) throw new Error('Empréstimo não encontrado');

            if (emprestimo.status !== 'ativo') {
                throw new Error('Empréstimo já foi quitado');
            }

            // Calcular valor para quitação (valor original + juros pendentes)
            const valorQuitacao = emprestimo.valor;

            if (!confirm(`Confirma quitação do empréstimo no valor de R$ ${valorQuitacao.toFixed(2)}?`)) {
                return;
            }

            // Registrar pagamento de quitação
            const { error: pagamentoError } = await this.supabase
                .from('pagamentos')
                .insert([{
                    emprestimo_id: emprestimoId,
                    valor: valorQuitacao,
                    data_pagamento: new Date().toISOString().split('T')[0],
                    tipo: 'quitacao',
                    observacoes: 'Quitação total do empréstimo'
                }]);

            if (pagamentoError) throw pagamentoError;

            // Atualizar status do empréstimo
            const { error: updateError } = await this.supabase
                .from('emprestimos')
                .update({
                    status: 'quitado',
                    data_quitacao: new Date().toISOString().split('T')[0],
                    valor_pago: emprestimo.valor_pago + valorQuitacao
                })
                .eq('id', emprestimoId);

            if (updateError) throw updateError;

            this.mostrarNotificacao('Empréstimo quitado com sucesso!', 'success');
            await this.carregarEmprestimos();

        } catch (error) {
            console.error('Erro ao quitar empréstimo:', error);
            this.mostrarNotificacao(error.message, 'error');
        }
    }

    // HISTÓRICO
    async carregarHistorico(filtros = {}) {
        try {
            let query = this.supabase
                .from('pagamentos_detalhados')
                .select('*');

            // Aplicar filtros
            if (filtros.cliente) {
                query = query.ilike('cliente_nome', `%${filtros.cliente}%`);
            }

            if (filtros.tipo) {
                query = query.eq('tipo', filtros.tipo);
            }

            if (filtros.dataInicio) {
                query = query.gte('data_pagamento', filtros.dataInicio);
            }

            if (filtros.dataFim) {
                query = query.lte('data_pagamento', filtros.dataFim);
            }

            query = query.order('data_pagamento', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;

            this.cache.pagamentos = data;
            return data;

        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            this.mostrarNotificacao('Erro ao carregar histórico', 'error');
            return [];
        }
    }

    // DASHBOARD
    async carregarMetricasDashboard() {
        try {
            const { data, error } = await this.supabase
                .from('dashboard_metricas')
                .select('*')
                .single();

            if (error) throw error;

            return data;

        } catch (error) {
            console.error('Erro ao carregar métricas:', error);
            this.mostrarNotificacao('Erro ao carregar métricas do dashboard', 'error');
            return null;
        }
    }

    // ===================================================================
    // INTERFACE DO USUÁRIO
    // ===================================================================

    showLogin() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
    }

    showApp() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        this.atualizarHeader();
        this.navegarPara('dashboard');
    }

    atualizarHeader() {
        if (this.usuarioLogado) {
            document.getElementById('userName').textContent = this.usuarioLogado.nome;
            document.getElementById('userLevel').textContent = this.usuarioLogado.nivel;
        }
    }

    async navegarPara(pagina) {
        this.paginaAtual = pagina;

        // Esconder todas as páginas
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

        // Mostrar página selecionada
        const paginaElement = document.getElementById(`${pagina}Page`);
        if (paginaElement) {
            paginaElement.classList.remove('hidden');
        }

        // Atualizar navegação ativa
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('nav-item--active');
        });

        const navItem = document.querySelector(`[data-page="${pagina}"]`);
        if (navItem) {
            navItem.classList.add('nav-item--active');
        }

        // Carregar dados da página
        await this.carregarDadosPagina(pagina);
    }

    async carregarDadosPagina(pagina) {
        try {
            switch (pagina) {
                case 'dashboard':
                    await this.renderizarDashboard();
                    break;
                case 'clientes':
                    await this.renderizarClientes();
                    break;
                case 'emprestimos':
                    await this.renderizarEmprestimos();
                    break;
                case 'historico':
                    await this.renderizarHistorico();
                    break;
                case 'usuarios':
                    if (this.usuarioLogado.nivel === 'administrador') {
                        await this.renderizarUsuarios();
                    }
                    break;
            }
        } catch (error) {
            console.error(`Erro ao carregar página ${pagina}:`, error);
            this.mostrarNotificacao(`Erro ao carregar ${pagina}`, 'error');
        }
    }

    // ===================================================================
    // RENDERIZAÇÃO DAS PÁGINAS
    // ===================================================================

    async renderizarDashboard() {
        const metricas = await this.carregarMetricasDashboard();
        if (!metricas) return;

        // Atualizar cards de métricas
        document.getElementById('totalClientes').textContent = metricas.total_clientes_ativos || 0;
        document.getElementById('emprestimosAtivos').textContent = metricas.emprestimos_ativos || 0;
        document.getElementById('totalRecebido').textContent = `R$ ${(metricas.total_recebido || 0).toFixed(2)}`;
        document.getElementById('totalJuros').textContent = `R$ ${(metricas.total_juros_recebidos || 0).toFixed(2)}`;

        // TODO: Implementar gráficos com Chart.js
        this.renderizarGraficoDashboard();
    }

    async renderizarClientes() {
        const clientes = await this.carregarClientes();
        const tbody = document.getElementById('clientesTableBody');

        tbody.innerHTML = clientes.map(cliente => `
            <tr>
                <td>${cliente.nome}</td>
                <td>${cliente.cpf}</td>
                <td>${cliente.contato}</td>
                <td>
                    <span class="status status--${cliente.status}">
                        ${cliente.status}
                    </span>
                </td>
                <td>${cliente.responsavel?.nome || 'N/A'}</td>
                <td>
                    <button class="btn btn--sm btn--outline" onclick="sistema.editarCliente('${cliente.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async renderizarEmprestimos() {
        const emprestimos = await this.carregarEmprestimos();
        const tbody = document.getElementById('emprestimosTableBody');

        tbody.innerHTML = emprestimos.map(emprestimo => `
            <tr>
                <td>${emprestimo.cliente_nome}</td>
                <td>R$ ${emprestimo.valor.toFixed(2)}</td>
                <td>${(emprestimo.taxa_juros * 100).toFixed(2)}%</td>
                <td>${this.formatarData(emprestimo.data_vencimento)}</td>
                <td>
                    <span class="status status--${emprestimo.status}">
                        ${emprestimo.status}
                    </span>
                </td>
                <td>
                    ${emprestimo.status === 'ativo' ? `
                        <button class="btn btn--sm btn--success" onclick="sistema.pagarJuros('${emprestimo.id}')">
                            Pagar Juros
                        </button>
                        <button class="btn btn--sm btn--warning" onclick="sistema.quitarEmprestimo('${emprestimo.id}')">
                            Quitar
                        </button>
                        <button class="btn btn--sm btn--info" onclick="sistema.abrirWhatsApp('${emprestimo.cliente_id}', '${emprestimo.id}')">
                            WhatsApp
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }

    async renderizarHistorico() {
        const historico = await this.carregarHistorico();
        const tbody = document.getElementById('historicoTableBody');

        tbody.innerHTML = historico.map(pagamento => `
            <tr>
                <td>${this.formatarData(pagamento.data_pagamento)}</td>
                <td>${pagamento.cliente_nome}</td>
                <td>
                    <span class="badge badge--${pagamento.tipo === 'juros' ? 'info' : 'success'}">
                        ${pagamento.tipo}
                    </span>
                </td>
                <td>R$ ${pagamento.valor.toFixed(2)}</td>
                <td>${pagamento.observacoes || '-'}</td>
            </tr>
        `).join('');
    }

    // ===================================================================
    // EVENT LISTENERS
    // ===================================================================

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const success = await this.login(username, password);
            if (success) {
                document.getElementById('loginForm').reset();
            }
        });

        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });

        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-page]')) {
                const pagina = e.target.dataset.page;
                this.navegarPara(pagina);
            }
        });

        // Sidebar toggle
        document.getElementById('toggleSidebar')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('sidebar--collapsed');
        });
    }

    // ===================================================================
    // UTILITÁRIOS
    // ===================================================================

    hashPassword(password) {
        // Implementação simples para demo - EM PRODUÇÃO USE BCRYPT
        return btoa(password);
    }

    formatarData(data) {
        return new Date(data).toLocaleDateString('pt-BR');
    }

    mostrarNotificacao(mensagem, tipo = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${tipo}`;
        notification.innerHTML = `
            <i class="fas fa-${tipo === 'success' ? 'check' : tipo === 'error' ? 'times' : 'info'}-circle"></i>
            ${mensagem}
        `;

        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    abrirWhatsApp(clienteId, emprestimoId) {
        // TODO: Implementar integração WhatsApp com dados do Supabase
        this.mostrarNotificacao('Funcionalidade WhatsApp em desenvolvimento', 'info');
    }

    renderizarGraficoDashboard() {
        // TODO: Implementar gráficos Chart.js com dados do Supabase
        console.log('Renderizando gráfico do dashboard...');
    }
}

// ===================================================================
// INICIALIZAÇÃO GLOBAL
// ===================================================================

// Aguardar DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    window.sistema = new SistemaEmprestimosSupabase();
});

// Export para uso em módulos
export default SistemaEmprestimosSupabase;