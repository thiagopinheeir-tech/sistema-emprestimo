// app.js

// Carrega variáveis de ambiente definidas em env.js
const SUPABASE_URL      = window.process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.process.env.SUPABASE_ANON_KEY;
// Usa window.supabase do CDN para criar o cliente
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class SistemaEmprestimos {
  constructor() {
    this.supabase = supabaseClient;
    this.isAuthenticated = false;
    this.currentUser = null;
    this.currentPage = 'dashboard';
    this.sidebarOpen = true;
    this.zoomLevel = 1.0;
    this.users = [];
    this.clientes = [];
    this.emprestimos = [];
    this.historicoPagamentos = [];
    this.init();
  }

  async init() {
    await this.loadInitialData();
    this.bindGlobalEvents();
    this.showLogin();
    this.setupResponsiveNavigation();
  }

  // Carrega usuários iniciais
  async loadInitialData() {
    const { data: users } = await this.supabase.from('usuarios').select('*');
    this.users = users || [];
    if (!this.users.length) {
      await this.createDefaultUsers();
    }
  }

  // Cria usuários padrão
  async createDefaultUsers() {
    const defaultUsers = [
      { username: 'admin',    password: '123456', name: 'Administrador',      role: 'admin',    gerente_id: null, status: 'ativo' },
      { username: 'gerente',  password: '123456', name: 'Gerente Financeiro', role: 'manager',  gerente_id: null, status: 'ativo' },
      { username: 'operador', password: '123456', name: 'Operador',           role: 'operator', gerente_id: null, status: 'ativo' }
    ];
    await this.supabase.from('usuarios').insert(defaultUsers);
    const { data: mgr } = await this.supabase
      .from('usuarios').select('id').eq('username', 'gerente').single();
    await this.supabase.from('usuarios').update({ gerente_id: mgr.id }).eq('username', 'operador');
    const { data } = await this.supabase.from('usuarios').select('*');
    this.users = data || [];
  }

  // Login
  async login(username, password) {
    const { data } = await this.supabase
      .from('usuarios')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .eq('status', 'ativo');
    if (data.length) {
      this.isAuthenticated = true;
      this.currentUser = data[0];
      return true;
    }
    return false;
  }

  // Logout
  logout() {
    this.isAuthenticated = false;
    this.currentUser = null;
    document.body.className = '';
    this.showLogin();
  }

  // Carrega clientes
  async loadClientes() {
    const { data } = await this.supabase
      .from('clientes').select('*')
      .order('created_at', { ascending: false });
    this.clientes = data || [];
  }

  // Carrega empréstimos
  async loadEmprestimos() {
    const { data } = await this.supabase
      .from('emprestimos').select('*')
      .order('created_at', { ascending: false });
    this.emprestimos = data || [];
  }

  // Carrega histórico
  async loadHistorico() {
    const { data } = await this.supabase
      .from('historico_pagamentos').select('*')
      .order('created_at', { ascending: false });
    this.historicoPagamentos = data || [];
  }

  // Insere cliente
  async addCliente(clienteData) {
    await this.supabase.from('clientes').insert([{
      ...clienteData,
      responsavel_id: this.currentUser.id,
      status: 'ativo'
    }]);
    await this.loadClientes();
  }

  // Insere empréstimo
  async addEmprestimo(data) {
    await this.supabase.from('emprestimos').insert([{
      ...data,
      responsavel_id: this.currentUser.id,
      status: 'ativo'
    }]);
    await this.loadEmprestimos();
  }

  // Insere pagamento e atualiza status se quitação
  async addPagamento(empId, pagamento) {
    await this.supabase.from('historico_pagamentos').insert([{
      ...pagamento,
      emprestimo_id: empId,
      cliente_id: pagamento.clienteId,
      responsavel_id: this.currentUser.id
    }]);
    if (pagamento.tipo === 'quitacao') {
      await this.supabase
        .from('emprestimos')
        .update({ status: 'quitado' })
        .eq('id', empId);
      await this.loadEmprestimos();
    }
    await this.loadHistorico();
  }

  // Exibe login
  showLogin() {
    document.getElementById('loginContainer').classList.remove('hidden');
    document.getElementById('appContainer').classList.add('hidden');
  }

  // Exibe app
  showApp() {
    document.getElementById('loginContainer').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    this.updateUserInfo();
    this.applyRolePermissions();
    this.showPage(this.currentPage);
  }

  // Atualiza header
  updateUserInfo() {
    document.getElementById('userName').textContent = this.currentUser.name;
    const roleNames = { admin: 'Administrador', manager: 'Gerente', operator: 'Operador' };
    document.getElementById('userRole').textContent = roleNames[this.currentUser.role];
  }

  // Permissões
  applyRolePermissions() {
    document.body.classList.remove('role-admin', 'role-manager', 'role-operator');
    document.body.classList.add(`role-${this.currentUser.role}`);
    document.querySelectorAll('.admin-only')
      .forEach(el => el.classList.toggle('hidden', this.currentUser.role !== 'admin'));
    document.querySelectorAll('.manager-only')
      .forEach(el => el.classList.toggle('hidden', !['admin','manager'].includes(this.currentUser.role)));
    document.querySelectorAll('.operator-only')
      .forEach(el => el.classList.toggle('hidden', this.currentUser.role !== 'operator'));
  }

  // Paginação
  async showPage(pageId) {
    this.currentPage = pageId;
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll(`[data-page="${pageId}"]`).forEach(item => item.classList.add('active'));
    document.getElementById('pageTitle').textContent = {
      dashboard: 'Dashboard Financeiro',
      cadastro: 'Cadastro de Clientes',
      emprestimos: 'Tabela de Empréstimos',
      historico: 'Histórico de Pagamentos',
      usuarios: 'Gerenciar Usuários'
    }[pageId] || '';

    const container = document.getElementById('pagesContainer');
    container.innerHTML = '';

    switch (pageId) {
      case 'dashboard':
        DashboardModule.render(container);
        DashboardModule.loadData();
        break;

      case 'cadastro':
        await this.loadClientes();
        ClientesModule.render(container);
        ClientesModule.loadData();
        break;

      case 'emprestimos':
        await this.loadEmprestimos();
        EmprestimosModule.render(container);
        EmprestimosModule.loadData();
        break;

      case 'historico':
        await this.loadHistorico();
        HistoricoModule.render(container);
        HistoricoModule.loadData();
        break;

      case 'usuarios':
        if (this.currentUser.role === 'admin') {
          UsuariosModule.render(container);
          UsuariosModule.loadData();
        } else {
          container.innerHTML = '<div class="no-access"><h3>Acesso negado</h3></div>';
        }
        break;
    }

    if (window.innerWidth <= 768) this.closeSidebar();
  }

  // Atalhos teclado
  bindGlobalEvents() {
    document.addEventListener('keydown', async e => {
      if (!e.altKey) return;
      let page = null;
      if (e.key === '1') page = 'dashboard';
      if (e.key === '2') page = 'cadastro';
      if (e.key === '3') page = 'emprestimos';
      if (e.key === '4') page = 'historico';
      if (e.key === '5') page = 'usuarios';
      if (page) await this.showPage(page);
    });
  }

  // Sidebar
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const main = document.querySelector('.main-content');
    if (window.innerWidth > 768) {
      sidebar.classList.toggle('collapsed');
      main.classList.toggle('sidebar-collapsed');
    } else {
      sidebar.classList.toggle('open');
    }
  }
  closeSidebar() {
    if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
  }
  setupResponsiveNavigation() {
    document.addEventListener('click', e => {
      const sidebar = document.getElementById('sidebar');
      if (window.innerWidth <= 768 &&
          sidebar.classList.contains('open') &&
          !sidebar.contains(e.target)) {
        this.closeSidebar();
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) document.getElementById('sidebar').classList.remove('open');
    });
  }
}

// Inicialização ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  window.sistema = new SistemaEmprestimos();
});
