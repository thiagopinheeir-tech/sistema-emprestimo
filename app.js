// Sistema de Empréstimos - Arquivo Principal (app.js)
// =====================================================

class SistemaEmprestimos {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.sidebarOpen = true;
        this.zoomLevel = 1.0;

        // Usuários padrão do sistema
        this.users = [
            {"id": "1", "username": "admin", "password": "123456", "name": "Administrador", "role": "admin", "gerenteId": null, "status": "ativo"},
            {"id": "2", "username": "gerente", "password": "123456", "name": "Gerente Financeiro", "role": "manager", "gerenteId": null, "status": "ativo"},
            {"id": "3", "username": "operador", "password": "123456", "name": "Operador", "role": "operator", "gerenteId": "2", "status": "ativo"}
        ];

        // Dados de exemplo (podem ser removidos em produção)
        this.clientes = [
            {"id": "1", "nome": "Maria Silva", "contato": "(11) 99999-1111", "endereco": "Rua das Flores, 123", "documento": "123.456.789-01", "dataNascimento": "1985-03-15", "foto": "", "observacoes": "Cliente preferencial", "status": "ativo", "responsavelId": "3"},
            {"id": "2", "nome": "João Santos", "contato": "(11) 88888-2222", "endereco": "Av. Principal, 456", "documento": "987.654.321-02", "dataNascimento": "1990-08-22", "foto": "", "observacoes": "Novo cliente", "status": "ativo", "responsavelId": "3"},
            {"id": "3", "nome": "Ana Costa", "contato": "(11) 77777-3333", "endereco": "Rua do Comércio, 789", "documento": "456.789.123-03", "dataNascimento": "1988-12-10", "foto": "", "observacoes": "Cliente antigo", "status": "ativo", "responsavelId": "2"}
        ];

        this.emprestimos = [
            {"id": "emp1", "clienteId": "1", "valorPrincipal": 5000.00, "jurosPerc": 10.0, "dataInicio": "2024-01-15", "status": "ativo", "responsavelId": "3", "pagamentos": []},
            {"id": "emp2", "clienteId": "2", "valorPrincipal": 3000.00, "jurosPerc": 8.0, "dataInicio": "2024-02-01", "status": "ativo", "responsavelId": "3", "pagamentos": []},
            {"id": "emp3", "clienteId": "3", "valorPrincipal": 8000.00, "jurosPerc": 12.0, "dataInicio": "2024-01-01", "status": "ativo", "responsavelId": "2", "pagamentos": []}
        ];

        this.historicoPagamentos = [
            {"id": "hist1", "clienteId": "1", "emprestimoId": "emp1", "valorPago": 500.00, "tipo": "juros", "dataPagamento": "2024-02-15", "responsavelId": "3"},
            {"id": "hist2", "clienteId": "2", "emprestimoId": "emp2", "valorPago": 240.00, "tipo": "juros", "dataPagamento": "2024-03-01", "responsavelId": "3"},
            {"id": "hist3", "clienteId": "3", "emprestimoId": "emp3", "valorPago": 960.00, "tipo": "juros", "dataPagamento": "2024-02-01", "responsavelId": "2"}
        ];

        this.init();
    }

    init() {
        this.bindGlobalEvents();
        this.showLogin();
        this.setupResponsiveNavigation();
    }

    // ========== AUTENTICAÇÃO ==========
    showLogin() {
        document.getElementById('loginContainer').classList.remove('hidden');
        document.getElementById('appContainer').classList.add('hidden');
    }

    showApp() {
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');
        this.updateUserInfo();
        this.applyRolePermissions();
        this.showPage(this.currentPage);
    }

    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password && u.status === 'ativo');
        if (user) {
            this.isAuthenticated = true;
            this.currentUser = user;
            return true;
        }
        return false;
    }

    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        // Limpar gráficos se existirem
        if (window.timelineChartInstance) {
            window.timelineChartInstance.destroy();
            window.timelineChartInstance = null;
        }
        document.body.className = '';
        this.showLogin();
    }

    updateUserInfo() {
        document.getElementById('userName').textContent = this.currentUser.name;
        const roleNames = {
            'admin': 'Administrador',
            'manager': 'Gerente',
            'operator': 'Operador'
        };
        document.getElementById('userRole').textContent = roleNames[this.currentUser.role];
    }

    applyRolePermissions() {
        document.body.classList.remove('role-admin', 'role-manager', 'role-operator');
        document.body.classList.add(`role-${this.currentUser.role}`);

        const adminElements = document.querySelectorAll('.admin-only');
        const managerElements = document.querySelectorAll('.manager-only');
        const operatorElements = document.querySelectorAll('.operator-only');

        adminElements.forEach(el => el.classList.add('hidden'));
        managerElements.forEach(el => el.classList.add('hidden'));
        operatorElements.forEach(el => el.classList.add('hidden'));

        if (this.currentUser.role === 'admin') {
            adminElements.forEach(el => el.classList.remove('hidden'));
            managerElements.forEach(el => el.classList.remove('hidden'));
        } else if (this.currentUser.role === 'manager') {
            managerElements.forEach(el => el.classList.remove('hidden'));
        } else if (this.currentUser.role === 'operator') {
            operatorElements.forEach(el => el.classList.remove('hidden'));
        }
    }

    // ========== NAVEGAÇÃO ==========
    showPage(pageId) {
        this.currentPage = pageId;

        // Atualizar botões ativos
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll(`[data-page="${pageId}"]`).forEach(item => {
            item.classList.add('active');
        });

        const titles = {
            'dashboard': 'Dashboard Financeiro',
            'cadastro': 'Cadastro de Clientes',
            'emprestimos': 'Tabela de Empréstimos',
            'historico': 'Histórico de Pagamentos',
            'usuarios': 'Gerenciar Usuários'
        };

        document.getElementById('pageTitle').textContent = titles[pageId];

        // Limpar container e carregar página específica
        const container = document.getElementById('pagesContainer');
        container.innerHTML = '';

        // Carregar conteúdo da página
        switch(pageId) {
            case 'dashboard':
                if (typeof DashboardModule !== 'undefined') {
                    DashboardModule.render(container);
                    DashboardModule.loadData();
                }
                break;
            case 'cadastro':
                if (typeof ClientesModule !== 'undefined') {
                    ClientesModule.render(container);
                    ClientesModule.loadData();
                }
                break;
            case 'emprestimos':
                if (typeof EmprestimosModule !== 'undefined') {
                    EmprestimosModule.render(container);
                    EmprestimosModule.loadData();
                }
                break;
            case 'historico':
                if (typeof HistoricoModule !== 'undefined') {
                    HistoricoModule.render(container);
                    HistoricoModule.loadData();
                }
                break;
            case 'usuarios':
                if (typeof UsuariosModule !== 'undefined' && this.currentUser.role === 'admin') {
                    UsuariosModule.render(container);
                    UsuariosModule.loadData();
                } else {
                    container.innerHTML = '<div class="page"><p>Acesso negado</p></div>';
                }
                break;
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');

        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('open');
        } else {
            this.sidebarOpen = !this.sidebarOpen;
            if (this.sidebarOpen) {
                sidebar.classList.remove('collapsed');
                mainContent.classList.remove('sidebar-collapsed');
            } else {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('sidebar-collapsed');
            }
        }
    }

    setupResponsiveNavigation() {
        const sidebar = document.getElementById('sidebar');
        const bottomNav = document.getElementById('bottomNav');

        if (window.innerWidth <= 768) {
            sidebar.classList.remove('collapsed', 'open');
            bottomNav.style.display = 'flex';
        } else {
            bottomNav.style.display = 'none';
            sidebar.classList.remove('open');
            if (!this.sidebarOpen) {
                sidebar.classList.add('collapsed');
            }
        }
    }

    // ========== PERMISSÕES ==========
    canViewClient(clienteId) {
        if (this.currentUser.role === 'admin') return true;
        
        const cliente = this.clientes.find(c => c.id === clienteId);
        if (!cliente) return false;
        
        if (this.currentUser.role === 'manager') {
            if (cliente.responsavelId === this.currentUser.id) return true;
            const responsavel = this.users.find(u => u.id === cliente.responsavelId);
            return responsavel && responsavel.gerenteId === this.currentUser.id;
        }
        
        if (this.currentUser.role === 'operator') {
            return cliente.responsavelId === this.currentUser.id;
        }
        
        return false;
    }

    canEditClient(clienteId) {
        if (this.currentUser.role === 'admin') return true;
        const cliente = this.clientes.find(c => c.id === clienteId);
        if (!cliente) return false;
        return cliente.responsavelId === this.currentUser.id;
    }

    getFilteredClientes() {
        return this.clientes.filter(cliente => this.canViewClient(cliente.id));
    }

    getFilteredEmprestimos() {
        return this.emprestimos.filter(emp => {
            const cliente = this.clientes.find(c => c.id === emp.clienteId);
            return cliente && this.canViewClient(cliente.id);
        });
    }

    getFilteredHistorico() {
        return this.historicoPagamentos.filter(hist => {
            const cliente = this.clientes.find(c => c.id === hist.clienteId);
            return cliente && this.canViewClient(cliente.id);
        });
    }

    // ========== EVENTOS GLOBAIS ==========
    bindGlobalEvents() {
        // Login
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsuario').value.trim();
            const password = document.getElementById('loginSenha').value.trim();
            const loginBtn = document.getElementById('loginBtn');
            const loginError = document.getElementById('loginError');

            loginBtn.querySelector('.login-btn-text').classList.add('hidden');
            loginBtn.querySelector('.login-btn-loading').classList.remove('hidden');
            loginBtn.disabled = true;

            setTimeout(() => {
                if (this.login(username, password)) {
                    this.showApp();
                } else {
                    loginError.classList.remove('hidden');
                }

                loginBtn.querySelector('.login-btn-text').classList.remove('hidden');
                loginBtn.querySelector('.login-btn-loading').classList.add('hidden');
                loginBtn.disabled = false;
            }, 1000);
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Navegação
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.getAttribute('data-page');
                this.showPage(page);
                
                // Fechar sidebar mobile
                if (window.innerWidth <= 768) {
                    document.getElementById('sidebar').classList.remove('open');
                }
            });
        });

        // Toggle sidebar
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Responsividade
        window.addEventListener('resize', () => {
            this.setupResponsiveNavigation();
        });

        // Fechar modal clicando fora
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
        });
    }
}

// Inicializar sistema quando DOM carregado
document.addEventListener('DOMContentLoaded', () => {
    window.sistema = new SistemaEmprestimos();
});