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
    this.users = [];
    this.clientes = [];
    this.emprestimos = [];
    this.historicoPagamentos = [];
    this.init();
  }

  initSupabase() {
    if (
      typeof SUPASE_CONFIG !== "undefined" &&
      SUPASE_CONFIG.url &&
      SUPASE_CONFIG.anonKey
    ) {
      this.supabase = supabase.createClient(
        SUPASE_CONFIG.url,
        SUPASE_CONFIG.anonKey
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
    if (this.supabase) await this.loadInitialData();
  }

  async loadInitialData() {
    try {
      await Promise.all([
        this.loadUsers(),
        this.loadClientes(),
        this.loadEmprestimos(),
        this.loadHistorico()
      ]);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
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
      if (error || !data) return false;
      this.isAuthenticated = true;
      this.currentUser = data;
      await this.loadInitialData();
      return true;
    } catch (error) {
      console.error("Erro no login:", error);
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
    if (!this.currentUser) return;
    const userNameElem = document.getElementById("userName");
    const userRoleElem = document.getElementById("userRole");
    if (userNameElem) userNameElem.textContent = this.currentUser.name;
    if (userRoleElem)
      userRoleElem.textContent =
        {
          admin: "Administrador",
          manager: "Gerente",
          operator: "Operador",
        }[this.currentUser.role] || this.currentUser.role;
  }

  applyRolePermissions() {
    if (!this.currentUser) return;
    document.body.classList.remove("role-admin", "role-manager", "role-operator");
    document.body.classList.add(`role-${this.currentUser.role}`);
    document.querySelectorAll(".admin-only").forEach((el) =>
      el.classList.toggle("hidden", this.currentUser.role !== "admin")
    );
    document.querySelectorAll(".manager-only").forEach((el) =>
      el.classList.toggle(
        "hidden",
        !["admin", "manager"].includes(this.currentUser.role)
      )
    );
    document.querySelectorAll(".operator-only").forEach((el) =>
      el.classList.toggle("hidden", this.currentUser.role !== "operator")
    );
  }

  showPage(pageId) {
    if (!this.currentUser) {
      this.showLogin();
      return;
    }
    this.currentPage = pageId;
    document.querySelectorAll(".nav-item").forEach((el) =>
      el.classList.remove("active")
    );
    document.querySelectorAll(`[data-page="${pageId}"]`).forEach((el) =>
      el.classList.add("active")
    );
    const titles = {
      dashboard: "Dashboard Financeiro",
      cadastro: "Cadastro de Clientes",
      emprestimos: "Tabela de Empréstimos",
      historico: "Histórico de Pagamentos",
      usuarios: "Gerenciar Usuários",
    };
    const titleElem = document.getElementById("pageTitle");
    if (titleElem) titleElem.textContent = titles[pageId] || "";
    const container = document.getElementById("pagesContainer");
    if (container) container.innerHTML = "";
    switch (pageId) {
      case "dashboard":
        if (window.DashboardModule) {
          DashboardModule.render(container);
          DashboardModule.loadData && DashboardModule.loadData();
        }
        break;
      case "cadastro":
        if (window.ClientesModule) {
          ClientesModule.render(container);
          ClientesModule.loadData && ClientesModule.loadData();
        }
        break;
      case "emprestimos":
        if (window.EmprestimosModule) {
          EmprestimosModule.render(container);
          EmprestimosModule.loadData && EmprestimosModule.loadData();
        }
        break;
      case "historico":
        if (window.HistoricoModule) {
          HistoricoModule.render(container);
          HistoricoModule.loadData && HistoricoModule.loadData();
        }
        break;
      case "usuarios":
        if (window.UsuariosModule && this.currentUser.role === "admin") {
          UsuariosModule.render(container);
          UsuariosModule.loadData && UsuariosModule.loadData();
        } else {
          container.innerHTML = "<div class='no-access'>Acesso negado</div>";
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
        document.querySelectorAll(".modal").forEach((modal) =>
          modal.classList.add("hidden")
        );
      }
    });
  }

  setupResponsiveNavigation() {
    const toggleBtn = document.querySelector(".sidebar-toggle");
    const sidebar = document.querySelector(".sidebar");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        if (sidebar) sidebar.classList.toggle("open");
      });
    }
  }

  toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) sidebar.classList.toggle("open");
  }
}
