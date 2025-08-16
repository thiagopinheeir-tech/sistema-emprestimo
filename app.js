// Sistema de Empréstimos - Arquivo Principal (app.js)
// =====================================================

class SistemaEmprestimos {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.currentPage = 'dashboard';
    this.sidebarOpen = true;
    this.zoomLevel = 1.0;

    // Inicializar Supabase
    this.supabase = null;
    this.initSupabase();

    // Arrays para cache local
    this.users = [];
    this.clientes = [];
    this.emprestimos = [];
    this.historicoPagamentos = [];

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
          UsuariosModule.render(container);
          UsuariosModule.loadData();
        } else {
          container.innerHTML = '<div class="no-access"><h3>Acesso negado</h3></div>';
        }
        break;
    }
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