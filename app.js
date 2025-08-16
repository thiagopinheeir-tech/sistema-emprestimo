<<<<<<< HEAD
// Sistema de Empréstimos - Arquivo Principal (app.js)
// =====================================================

class SistemaEmprestimos {
  constructor() {
=======
// app.js

// Variáveis de ambiente carregadas de env.js
const SUPABASE_URL = window.process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.process.env.SUPABASE_ANON_KEY;
// Cliente Supabase inicializado via CDN
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class SistemaEmprestimos {
  constructor() {
    this.supabase = supabaseClient;
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
    this.isAuthenticated = false;
    this.currentUser = null;
    this.currentPage = 'dashboard';
    this.sidebarOpen = true;
    this.zoomLevel = 1.0;
<<<<<<< HEAD

    // Inicializar Supabase
    this.supabase = null;
    this.initSupabase();

    // Arrays para cache local
=======
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
    this.users = [];
    this.clientes = [];
    this.emprestimos = [];
    this.historicoPagamentos = [];
<<<<<<< HEAD

    this.init();
  }

  initSupabase() {
    if (typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
      this.supabase = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      console.log('Supabase conectado com sucesso!');
    } else {
      console.error('Configuração do Supabase não encontrada. Configure o arquivo env.js');
    }
  }

  async init() {
    this.bindGlobalEvents();
    this.showLogin();
    this.setupResponsiveNavigation();
    
    // Carregar dados iniciais se Supabase estiver configurado
    if (this.supabase) {
      await this.loadInitialData();
    }
  }

  // ========== CARREGAMENTO DE DADOS ========== 
  async loadInitialData() {
    try {
      await Promise.all([
        this.loadUsers(),
        this.loadClientes(),
        this.loadEmprestimos(),
        this.loadHistorico()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  async loadUsers() {
    try {
      const { data, error } = await this.supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      this.users = data || [];
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      this.users = [];
    }
  }

  async loadClientes() {
    try {
      const { data, error } = await this.supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      this.clientes = data || [];
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      this.clientes = [];
    }
  }

  async loadEmprestimos() {
    try {
      const { data, error } = await this.supabase
        .from('emprestimos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      this.emprestimos = data || [];
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error);
      this.emprestimos = [];
    }
  }

  async loadHistorico() {
    try {
      const { data, error } = await this.supabase
        .from('historico_pagamentos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      this.historicoPagamentos = data || [];
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      this.historicoPagamentos = [];
    }
  }

  // ========== AUTENTICAÇÃO ========== 
=======
    this.init();
  }

  async init() {
    await this.loadInitialData();
    this.bindGlobalEvents();
    this.showLogin();
    this.setupResponsiveNavigation();
  }

  // Carrega usuários do banco
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
      { username: 'admin', password: '123456', name: 'Administrador', role: 'admin', gerente_id: null, status: 'ativo' },
      { username: 'gerente', password: '123456', name: 'Gerente Financeiro', role: 'manager', gerente_id: null, status: 'ativo' },
      { username: 'operador', password: '123456', name: 'Operador', role: 'operator', gerente_id: null, status: 'ativo' }
    ];
    await this.supabase.from('usuarios').insert(defaultUsers);
    const { data: mgr } = await this.supabase.from('usuarios').select('id').eq('username', 'gerente').single();
    await this.supabase.from('usuarios').update({ gerente_id: mgr.id }).eq('username', 'operador');
    const { data } = await this.supabase.from('usuarios').select('*');
    this.users = data || [];
  }

  // Realiza login verificando usuário e senha
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

  logout() {
    this.isAuthenticated = false;
    this.currentUser = null;
    document.body.className = '';
    this.showLogin();
  }

  // Carrega clientes
  async loadClientes() {
    const { data } = await this.supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });
    this.clientes = data || [];
  }

  // Carrega empréstimos
  async loadEmprestimos() {
    const { data } = await this.supabase
      .from('emprestimos')
      .select('*')
      .order('created_at', { ascending: false });
    this.emprestimos = data || [];
  }

  // Carrega histórico de pagamentos
  async loadHistorico() {
    const { data } = await this.supabase
      .from('historico_pagamentos')
      .select('*')
      .order('created_at', { ascending: false });
    this.historicoPagamentos = data || [];
  }

  // Inclui novo cliente
  async addCliente(clienteData) {
    await this.supabase.from('clientes').insert([{
      ...clienteData,
      responsavel_id: this.currentUser.id,
      status: 'ativo'
    }]);
    await this.loadClientes();
  }

  // Inclui novo empréstimo
  async addEmprestimo(data) {
    await this.supabase.from('emprestimos').insert([{
      ...data,
      responsavel_id: this.currentUser.id,
      status: 'ativo'
    }]);
    await this.loadEmprestimos();
  }

  // Registra pagamento e atualiza status se quitado
  async addPagamento(empId, pagamento) {
    await this.supabase.from('historico_pagamentos').insert([{
      ...pagamento,
      emprestimo_id: empId,
      cliente_id: pagamento.clienteId,
      responsavel_id: this.currentUser.id
    }]);
    if (pagamento.tipo === 'quitacao') {
      await this.supabase.from('emprestimos').update({ status: 'quitado' }).eq('id', empId);
      await this.loadEmprestimos();
    }
    await this.loadHistorico();
  }

  // Exibe tela de login
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
  showLogin() {
    document.getElementById('loginContainer').classList.remove('hidden');
    document.getElementById('appContainer').classList.add('hidden');
  }

<<<<<<< HEAD
=======
  // Exibe sistema após login
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
  showApp() {
    document.getElementById('loginContainer').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    this.updateUserInfo();
    this.applyRolePermissions();
    this.showPage(this.currentPage);
  }

<<<<<<< HEAD
  async login(username, password) {
    try {
      if (!this.supabase) {
        console.error('Supabase não configurado');
        return false;
      }

      const { data, error } = await this.supabase
        .from('usuarios')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('status', 'ativo')
        .single();

      if (error) {
        console.log('Erro de login:', error);
        return false;
      }

      if (data) {
        this.isAuthenticated = true;
        this.currentUser = data;
        await this.loadInitialData();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
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
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    
    if (userNameElement) userNameElement.textContent = this.currentUser.name;
    
    if (userRoleElement) {
      const roleNames = {
        'admin': 'Administrador',
        'manager': 'Gerente', 
        'operator': 'Operador'
      };
      userRoleElement.textContent = roleNames[this.currentUser.role] || this.currentUser.role;
    }
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
    
    const titleElement = document.getElementById('pageTitle');
    if (titleElement) titleElement.textContent = titles[pageId];

    // Limpar container e carregar página específica
    const container = document.getElementById('pagesContainer');
    if (container) container.innerHTML = '';

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
=======
  // Atualiza informações de usuário no cabeçalho
  updateUserInfo() {
    document.getElementById('userName').textContent = this.currentUser.name;
    const roleNames = { admin: 'Administrador', manager: 'Gerente', operator: 'Operador' };
    document.getElementById('userRole').textContent = roleNames[this.currentUser.role];
  }

  // Aplica permissões e mostra/esconde menus conforme papel
  applyRolePermissions() {
    document.body.classList.remove('role-admin', 'role-manager', 'role-operator');
    document.body.classList.add(`role-${this.currentUser.role}`);
    document.querySelectorAll('.admin-only').forEach(el => el.classList.toggle('hidden', this.currentUser.role !== 'admin'));
    document.querySelectorAll('.manager-only').forEach(el => el.classList.toggle('hidden', !['admin','manager'].includes(this.currentUser.role)));
    document.querySelectorAll('.operator-only').forEach(el => el.classList.toggle('hidden', this.currentUser.role !== 'operator'));
  }

  // Navegação entre páginas
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

    switch(pageId) {
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
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
          UsuariosModule.render(container);
          UsuariosModule.loadData();
        } else {
          container.innerHTML = '<div class="no-access"><h3>Acesso negado</h3></div>';
        }
        break;
    }
<<<<<<< HEAD
  }

  // ========== CRUD OPERATIONS ========== 
  async addCliente(clienteData) {
    try {
      const { data, error } = await this.supabase
        .from('clientes')
        .insert([{
          ...clienteData,
          responsavel_id: this.currentUser.id
        }])
        .select();

      if (error) throw error;
      
      await this.loadClientes();
      return data[0];
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      throw error;
    }
  }

  async updateCliente(id, clienteData) {
    try {
      const { data, error } = await this.supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      await this.loadClientes();
      return data[0];
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }

  async addEmprestimo(emprestimoData) {
    try {
      const { data, error } = await this.supabase
        .from('emprestimos')
        .insert([{
          ...emprestimoData,
          responsavel_id: this.currentUser.id
        }])
        .select();

      if (error) throw error;
      
      await this.loadEmprestimos();
      return data[0];
    } catch (error) {
      console.error('Erro ao adicionar empréstimo:', error);
      throw error;
    }
  }

  async addHistoricoPagamento(pagamentoData) {
    try {
      const { data, error } = await this.supabase
        .from('historico_pagamentos')
        .insert([{
          ...pagamentoData,
          responsavel_id: this.currentUser.id
        }])
        .select();

      if (error) throw error;
      
      await this.loadHistorico();
      return data[0];
    } catch (error) {
      console.error('Erro ao adicionar pagamento:', error);
      throw error;
    }
  }

  // ========== PERMISSÕES ========== 
  canEditClient(clienteId) {
    if (this.currentUser.role === 'admin') return true;
    
    const cliente = this.clientes.find(c => c.id === clienteId);
    if (!cliente) return false;
    
    if (this.currentUser.role === 'manager') {
      // Gerente pode editar clientes de seus operadores
      const responsavel = this.users.find(u => u.id === cliente.responsavel_id);
      return responsavel && responsavel.gerente_id === this.currentUser.id;
    }
    
    if (this.currentUser.role === 'operator') {
      return cliente.responsavel_id === this.currentUser.id;
    }
    
    return false;
  }

  getFilteredClientes() {
    if (this.currentUser.role === 'admin') {
      return this.clientes;
    }
    
    if (this.currentUser.role === 'manager') {
      // Gerente vê clientes de seus operadores
      const operadores = this.users.filter(u => u.gerente_id === this.currentUser.id);
      const operadorIds = operadores.map(op => op.id);
      return this.clientes.filter(c => operadorIds.includes(c.responsavel_id));
    }
    
    if (this.currentUser.role === 'operator') {
      return this.clientes.filter(c => c.responsavel_id === this.currentUser.id);
    }
    
    return [];
  }

  // ========== EVENTOS ========== 
  bindGlobalEvents() {
    // Click fora do modal para fechar
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.classList.add('hidden');
      }
    });

    // Escape para fechar modais
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
          modal.classList.add('hidden');
        });
      }
    });
  }

  setupResponsiveNavigation() {
    // Implementação para navegação responsiva
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        sidebar?.classList.toggle('open');
      });
    }
  }

  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
    }
  }

  // ========== CONTROLE DE ZOOM ========== 
  zoomIn() {
    this.zoomLevel = Math.min(this.zoomLevel + 0.1, 2.0);
    this.applyZoom();
  }

  zoomOut() {
    this.zoomLevel = Math.max(this.zoomLevel - 0.1, 0.5);
    this.applyZoom();
  }

  resetZoom() {
    this.zoomLevel = 1.0;
    this.applyZoom();
  }

  applyZoom() {
    const charts = document.querySelectorAll('.chart-container');
    charts.forEach(chart => {
      chart.style.transform = `scale(${this.zoomLevel})`;
    });
  }
}
=======

    if (window.innerWidth <= 768) this.closeSidebar();
  }

  // Atalhos Alt+1..5 para navegação
  bindGlobalEvents() {
    document.addEventListener('keydown', async e => {
      if (!e.altKey) return;
      let page = null;
      if (e.key === '1') page = 'dashboard';
      else if (e.key === '2') page = 'cadastro';
      else if (e.key === '3') page = 'emprestimos';
      else if (e.key === '4') page = 'historico';
      else if (e.key === '5') page = 'usuarios';
      if (page) await this.showPage(page);
    });
  }

  // Controla a sidebar
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

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
  window.sistema = new SistemaEmprestimos();
});
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
