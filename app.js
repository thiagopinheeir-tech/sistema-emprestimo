// Sistema de Empréstimos - Arquivo Principal (app.js)
// =====================================================

class SistemaEmprestimos {
  constructor() {
    // Inicializar Supabase usando configuração do env.js
    this.supabase = null;
    this.initSupabase();

    this.isAuthenticated = false;
    this.currentUser = null;
    this.currentPage = 'dashboard';
    this.sidebarOpen = true;
    this.zoomLevel = 1.0;

    // Arrays para cache local
    this.users = [];
    this.clientes = [];
    this.emprestimos = [];
    this.historicoPagamentos = [];

    this.init();
  }

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

  async init() {
    this.bindGlobalEvents();
    this.showLogin();
    this.setupResponsiveNavigation();
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
        this.loadHistorico(),
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }

  async loadUsers() {
    try {
      const { data, error } = await this.supabase
        .from("usuarios")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      this.users = data || [];
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      this.users = [];
    }
  }

  async loadClientes() {
    try {
      const { data, error } = await this.supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      this.clientes = data || [];
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      this.clientes = [];
    }
  }

  async loadEmprestimos() {
    try {
      const { data, error } = await this.supabase
        .from("emprestimos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      this.emprestimos = data || [];
    } catch (error) {
      console.error("Erro ao carregar empréstimos:", error);
      this.emprestimos = [];
    }
  }

  async loadHistorico() {
    try {
      const { data, error } = await this.supabase
        .from("historico_pagamentos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      this.historicoPagamentos = data || [];
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      this.historicoPagamentos = [];
    }
  }

  // ========== AUTENTICAÇÃO ==========
  async login(username, password) {
    try {
      if (!this.supabase) {
        console.error("Supabase não configurado");
        return false;
      }
      const { data, error } = await this.supabase
        .from("usuarios")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .eq("status", "ativo")
        .single();
      if (error || !data) {
        return false;
      }
      this.isAuthenticated = true;
      this.currentUser = data;
      await this.loadInitialData();
      return true;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return false;
    }
  }

  logout() {
    this.isAuthenticated = false;
    this.currentUser = null;
    document.body.className = "";
    this.showLogin();
  }

  showLogin() {
    document.getElementById("loginContainer").classList.remove("hidden");
    document.getElementById("appContainer").classList.add("hidden");
  }

  showApp() {
    document.getElementById("loginContainer").classList.add("hidden");
    document.getElementById("appContainer").classList.remove("hidden");
    this.updateUserInfo();
    this.applyRolePermissions();
    this.showPage(this.currentPage);
  }

  updateUserInfo() {
    const userNameElement = document.getElementById("userName");
    const userRoleElement = document.getElementById("userRole");
    if (userNameElement) userNameElement.textContent = this.currentUser.name;
    if (userRoleElement) {
      const roleNames = {
        admin: "Administrador",
        manager: "Gerente",
        operator: "Operador",
      };
      userRoleElement.textContent =
        roleNames[this.currentUser.role] || this.currentUser.role;
    }
  }

  applyRolePermissions() {
    document.body.classList.remove(
      "role-admin",
      "role-manager",
      "role-operator"
    );
    document.body.classList.add(`role-${this.currentUser.role}`);
    document
      .querySelectorAll(".admin-only")
      .forEach((el) =>
        el.classList.toggle("hidden", this.currentUser.role !== "admin")
      );
    document
      .querySelectorAll(".manager-only")
      .forEach((el) =>
        el.classList.toggle(
          "hidden",
          !["admin", "manager"].includes(this.currentUser.role)
        )
      );
    document
      .querySelectorAll(".operator-only")
      .forEach((el) =>
        el.classList.toggle("hidden", this.currentUser.role !== "operator")
      );
  }

  showPage(pageId) {
    this.currentPage = pageId;
    document.querySelectorAll(".nav-item").forEach((item) =>
      item.classList.remove("active")
    );
    document
      .querySelectorAll(`[data-page="${pageId}"]`)
      .forEach((item) => item.classList.add("active"));
    const titles = {
      dashboard: "Dashboard Financeiro",
      cadastro: "Cadastro de Clientes",
      emprestimos: "Tabela de Empréstimos",
      historico: "Histórico de Pagamentos",
      usuarios: "Gerenciar Usuários",
    };
    const titleElement = document.getElementById("pageTitle");
    if (titleElement) titleElement.textContent = titles[pageId] || "";
    const container = document.getElementById("pagesContainer");
    if (container) container.innerHTML = "";
    switch (pageId) {
      case "dashboard":
        if (typeof DashboardModule !== "undefined") {
          DashboardModule.render(container);
          if (DashboardModule.loadData) DashboardModule.loadData();
        }
        break;
      case "cadastro":
        if (typeof ClientesModule !== "undefined") {
          ClientesModule.render(container);
          if (ClientesModule.loadData) ClientesModule.loadData();
        }
        break;
      case "emprestimos":
        if (typeof EmprestimosModule !== "undefined") {
          EmprestimosModule.render(container);
          if (EmprestimosModule.loadData) EmprestimosModule.loadData();
        }
        break;
      case "historico":
        if (typeof HistoricoModule !== "undefined") {
          HistoricoModule.render(container);
          if (HistoricoModule.loadData) HistoricoModule.loadData();
        }
        break;
      case "usuarios":
        if (
          typeof UsuariosModule !== "undefined" &&
          this.currentUser.role === "admin"
        ) {
          UsuariosModule.render(container);
          if (UsuariosModule.loadData) UsuariosModule.loadData();
        } else {
          container.innerHTML =
            '<div class="no-access"><h3>Acesso negado</h3></div>';
        }
        break;
    }
  }

  bindGlobalEvents() {
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.classList.add("hidden");
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal").forEach((modal) => {
          modal.classList.add("hidden");
        });
      }
    });
  }

  setupResponsiveNavigation() {
    const sidebarToggle = document.querySelector(".sidebar-toggle");
    const sidebar = document.querySelector(".sidebar");
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        if (sidebar) sidebar.classList.toggle("open");
      });
    }
  }
}

// Não adiciona export, apenas utilize a classe no global `window.sistema = new SistemaEmprestimos();`

