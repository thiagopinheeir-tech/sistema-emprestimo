// Sistema de Empréstimos - Arquivo Principal
class SistemaEmprestimos {
  constructor() {
    this.supabase = null;
    this.initSupabase();
    this.isAuthenticated = false;
    this.currentUser = null;
    this.currentPage = 'dashboard';
    this.sidebarOpen = true;
    this.zoomLevel = 1.0;
    
    // Dados do sistema
    this.users = [
      {
        id: '1',
        nome: 'Administrador',
        username: 'admin',
        senha: '123456',
        role: 'admin',
        status: 'ativo'
      },
      {
        id: '2',
        nome: 'Gerente',
        username: 'gerente',
        senha: '123456',
        role: 'gerente',
        status: 'ativo'
      },
      {
        id: '3',
        nome: 'Operador',
        username: 'operador',
        senha: '123456',
        role: 'operador',
        status: 'ativo'
      }
    ];
    
    this.clientes = [];
    this.emprestimos = [];
    this.historicoPagamentos = [];
    
    this.init();
  }

  // Inicializar Supabase
  initSupabase() {
    if (
      typeof SUPABASE_CONFIG !== "undefined" &&
      SUPABASE_CONFIG.url &&
      SUPABASE_CONFIG.anonKey
    ) {
      this.supabase = supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey
      );
      console.log("Supabase conectado com sucesso!");
    } else {
      console.error(
        "Configuração do Supabase não encontrada. Configure o arquivo env.js"
      );
    }
  }

  // Inicializar sistema
  init() {
    this.showLogin();
    this.loadSampleData();
  }

  // Carregar dados de exemplo
  loadSampleData() {
    // Clientes de exemplo
    this.clientes = [
      {
        id: 'cli1',
        nome: 'João Silva',
        contato: '(85) 99999-0001',
        documento: '123.456.789-01',
        endereco: 'Rua das Flores, 123',
        observacoes: 'Cliente pontual',
        status: 'ativo',
        responsavel: '1'
      },
      {
        id: 'cli2',
        nome: 'Maria Santos',
        contato: '(85) 99999-0002',
        documento: '987.654.321-09',
        endereco: 'Av. Principal, 456',
        observacoes: 'Bom pagador',
        status: 'ativo',
        responsavel: '1'
      }
    ];

    // Empréstimos de exemplo
    this.emprestimos = [
      {
        id: 'emp1',
        clienteId: 'cli1',
        valor: 1000,
        juros: 10,
        status: 'ativo',
        criadoEm: '2024-01-15T10:00:00Z',
        proximoVencimento: '2024-02-15T10:00:00Z',
        responsavel: '1'
      },
      {
        id: 'emp2',
        clienteId: 'cli2',
        valor: 2000,
        juros: 8,
        status: 'ativo',
        criadoEm: '2024-01-20T10:00:00Z',
        proximoVencimento: '2024-02-20T10:00:00Z',
        responsavel: '1'
      }
    ];

    // Histórico de pagamentos de exemplo
    this.historicoPagamentos = [
      {
        id: 'pag1',
        emprestimoId: 'emp1',
        clienteId: 'cli1',
        tipo: 'juros',
        valor: 100,
        data: '2024-01-15T10:00:00Z',
        responsavel: '1'
      },
      {
        id: 'pag2',
        emprestimoId: 'emp2',
        clienteId: 'cli2',
        tipo: 'juros',
        valor: 160,
        data: '2024-01-20T10:00:00Z',
        responsavel: '1'
      }
    ];
  }

  // Mostrar tela de login
  showLogin() {
    document.getElementById('loginContainer').classList.remove('hidden');
    document.getElementById('appContainer').classList.add('hidden');
  }

  // Mostrar aplicação
  showApp() {
    document.getElementById('loginContainer').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    this.updateUserInfo();
    this.showPage('dashboard');
  }

  // Login
  async login(username, password) {
    const user = this.users.find(u => 
      u.username === username && 
      u.senha === password && 
      u.status === 'ativo'
    );

    if (user) {
      this.isAuthenticated = true;
      this.currentUser = user;
      return true;
    }

    return false;
  }

  // Logout
  logout() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.showLogin();
  }

  // Atualizar informações do usuário
  updateUserInfo() {
    if (this.currentUser) {
      document.getElementById('userName').textContent = this.currentUser.nome;
      document.getElementById('userRole').textContent = this.getRoleLabel(this.currentUser.role);
      
      // Mostrar/esconder botões admin
      const adminOnlyElements = document.querySelectorAll('.admin-only');
      adminOnlyElements.forEach(el => {
        el.style.display = this.currentUser.role === 'admin' ? 'block' : 'none';
      });
    }
  }

  // Obter label da role
  getRoleLabel(role) {
    const labels = {
      admin: 'Administrador',
      gerente: 'Gerente',
      operador: 'Operador'
    };
    return labels[role] || role;
  }

  // Mostrar página
  showPage(pageName) {
    this.currentPage = pageName;
    
    // Atualizar navegação ativa
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.page === pageName) {
        item.classList.add('active');
      }
    });

    // Atualizar título da página
    const titles = {
      dashboard: 'Dashboard',
      cadastro: 'Clientes',
      emprestimos: 'Empréstimos',
      historico: 'Histórico',
      usuarios: 'Usuários'
    };
    
    document.getElementById('pageTitle').textContent = titles[pageName] || 'Página';

    // Renderizar conteúdo da página
    const container = document.getElementById('pagesContainer');
    if (!container) return;

    switch (pageName) {
      case 'dashboard':
        container.innerHTML = DashboardModule.render();
        DashboardModule.init();
        break;
      case 'cadastro':
        container.innerHTML = ClientesModule.render();
        ClientesModule.init();
        break;
      case 'emprestimos':
        container.innerHTML = EmprestimosModule.render();
        EmprestimosModule.init();
        break;
      case 'historico':
        container.innerHTML = HistoricoModule.render();
        HistoricoModule.init();
        break;
      case 'usuarios':
        if (this.currentUser && this.currentUser.role === 'admin') {
          container.innerHTML = UsuariosModule.render();
          UsuariosModule.init();
        } else {
          container.innerHTML = '<p>Acesso negado. Apenas administradores podem acessar esta página.</p>';
        }
        break;
      default:
        container.innerHTML = '<p>Página não encontrada</p>';
    }
  }

  // Toggle sidebar
  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
    }
  }
}

console.log('✅ SistemaEmprestimos carregado com sucesso!');