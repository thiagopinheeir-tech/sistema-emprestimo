// app.js

// Configuração Supabase
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class SistemaEmprestimos {
  constructor() {
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

  // Carrega dados iniciais de usuários
  async loadInitialData() {
    const { data: users } = await supabase.from('usuarios').select('*');
    this.users = users || [];
    if (!this.users.length) {
      await this.createDefaultUsers();
    }
  }

  // Insere usuários padrão
  async createDefaultUsers() {
    const defaultUsers = [
      { username:'admin',   password:'123456', name:'Administrador',      role:'admin',    gerente_id:null, status:'ativo' },
      { username:'gerente', password:'123456', name:'Gerente Financeiro', role:'manager',  gerente_id:null, status:'ativo' },
      { username:'operador',password:'123456', name:'Operador',           role:'operator', gerente_id:null, status:'ativo' }
    ];
    await supabase.from('usuarios').insert(defaultUsers);
    const { data: mgr } = await supabase.from('usuarios').select('id').eq('username','gerente').single();
    await supabase.from('usuarios').update({ gerente_id: mgr.id }).eq('username','operador');
    const { data } = await supabase.from('usuarios').select('*');
    this.users = data || [];
  }

  // Login usando Supabase
  async login(username, password) {
    const { data } = await supabase
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

  // Carrega clientes do Supabase
  async loadClientes() {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });
    this.clientes = data || [];
  }

  // Carrega empréstimos do Supabase
  async loadEmprestimos() {
    const { data } = await supabase
      .from('emprestimos')
      .select('*')
      .order('created_at', { ascending: false });
    this.emprestimos = data || [];
  }

  // Carrega histórico de pagamentos do Supabase
  async loadHistorico() {
    const { data } = await supabase
      .from('historico_pagamentos')
      .select('*')
      .order('created_at', { ascending: false });
    this.historicoPagamentos = data || [];
  }

  // Adiciona cliente e recarrega lista
  async addCliente(clienteData) {
    await supabase.from('clientes').insert([{
      ...clienteData,
      responsavel_id: this.currentUser.id,
      status: 'ativo'
    }]);
    await this.loadClientes();
  }

  // Adiciona empréstimo e recarrega listas
  async addEmprestimo(data) {
    await supabase.from('emprestimos').insert([{
      ...data,
      responsavel_id: this.currentUser.id,
      status: 'ativo'
    }]);
    await this.loadEmprestimos();
  }

  // Adiciona pagamento e recarrega histórico e, se for quitação, atualiza status
  async addPagamento(empId, pagamento) {
    await supabase.from('historico_pagamentos').insert([{
      ...pagamento,
      emprestimo_id: empId,
      cliente_id: pagamento.clienteId,
      responsavel_id: this.currentUser.id
    }]);
    if (pagamento.tipo === 'quitacao') {
      await supabase
        .from('emprestimos')
        .update({ status: 'quitado' })
        .eq('id', empId);
      await this.loadEmprestimos();
    }
    await this.loadHistorico();
  }

  // Renderiza login
  showLogin() {
    document.getElementById('loginContainer').classList.remove('hidden');
    document.getElementById('appContainer').classList.add('hidden');
  }

  // Renderiza aplicação após login
  showApp() {
    document.getElementById('loginContainer').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    this.updateUserInfo();
    this.applyRolePermissions();
    this.showPage(this.currentPage);
  }

  // Atualiza informações do usuário no header
  updateUserInfo() {
    document.getElementById('userName').textContent = this.currentUser.name;
    const roleNames = { admin:'Administrador', manager:'Gerente', operator:'Operador' };
    document.getElementById('userRole').textContent = roleNames[this.currentUser.role];
  }

  // Aplica permissões por role
  applyRolePermissions() {
    document.body.classList.remove('role-admin','role-manager','role-operator');
    document.body.classList.add(`role-${this.currentUser.role}`);
    document.querySelectorAll('.admin-only').forEach(el => el.classList.toggle('hidden', this.currentUser.role!=='admin'));
    document.querySelectorAll('.manager-only').forEach(el => el.classList.toggle('hidden', !['admin','manager'].includes(this.currentUser.role)));
    document.querySelectorAll('.operator-only').forEach(el => el.classList.toggle('hidden', this.currentUser.role!=='operator'));
  }

  // Navegação assíncrona entre páginas
  async showPage(pageId) {
    this.currentPage = pageId;
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll(`[data-page="${pageId}"]`).forEach(item => item.classList.add('active'));
    document.getElementById('pageTitle').textContent = {
      dashboard:'Dashboard Financeiro',
      cadastro:'Cadastro de Clientes',
      emprestimos:'Tabela de Empréstimos',
      historico:'Histórico de Pagamentos',
      usuarios:'Gerenciar Usuários'
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
        if (this.currentUser.role==='admin') {
          UsuariosModule.render(container);
          UsuariosModule.loadData();
        } else {
          container.innerHTML = '<div class="no-access"><h3>Acesso negado</h3></div>';
        }
        break;
    }

    if (window.innerWidth <= 768) this.closeSidebar();
  }

  // Logout
  logout() {
    this.isAuthenticated = false;
    this.currentUser = null;
    document.body.className = '';
    this.showLogin();
  }

  // Eventos globais e teclado
  bindGlobalEvents() {
    document.addEventListener('keydown', e => {
      if (e.altKey) {
        { '1':()=>'dashboard','2':()=>'cadastro','3':()=>'emprestimos','4':()=>'historico','5':()=>'usuarios' }[e.key]?.call(this) && this.showPage({ '1':'dashboard','2':'cadastro','3':'emprestimos','4':'historico','5':'usuarios' }[e.key]);
      }
    });
  }

  // Sidebar responsivo
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const main = document.querySelector('.main-content');
    if (window.innerWidth>768) {
      sidebar.classList.toggle('collapsed');
      main.classList.toggle('sidebar-collapsed');
    } else {
      sidebar.classList.toggle('open');
    }
  }
  closeSidebar() {
    if (window.innerWidth<=768) document.getElementById('sidebar').classList.remove('open');
  }
  setupResponsiveNavigation() {
    document.addEventListener('click', e => { if (window.innerWidth<=768 && !document.getElementById('sidebar').contains(e.target) && document.getElementById('sidebar').classList.contains('open')) this.closeSidebar(); });
    window.addEventListener('resize', () => { if (window.innerWidth>768) document.getElementById('sidebar').classList.remove('open'); });
  }
}

// Inicialização na carga da página
window.addEventListener('DOMContentLoaded', () => {
  window.sistema = new SistemaEmprestimos();
});
