// Módulo Usuários
const UsuariosModule = {
  
  // Renderizar página de usuários
  render() {
    return `
      <div class="usuarios-container">
        <div class="usuarios-header">
          <h2>Gestão de Usuários</h2>
          <div class="usuarios-controls">
            <button id="addUsuario" class="btn btn--primary">+ Novo Usuário</button>
          </div>
        </div>
        
        <div class="usuarios-stats">
          <div class="stat-card">
            <div class="stat-value" id="totalUsuarios">0</div>
            <div class="stat-label">Total Usuários</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="usuariosAtivos">0</div>
            <div class="stat-label">Usuários Ativos</div>
          </div>
        </div>
        
        <div class="usuarios-list" id="usuariosList">
          <!-- Lista de usuários será preenchida dinamicamente -->
        </div>
      </div>
    `;
  },

  // Inicializar módulo
  init() {
    this.renderUsuariosList();
    this.updateStats();
    this.bindEvents();
  },

  // Bind de eventos
  bindEvents() {
    document.getElementById('addUsuario')?.addEventListener('click', () => {
      this.showUsuarioModal();
    });
  },

  // Renderizar lista de usuários
  renderUsuariosList() {
    const sistema = window.sistema;
    if (!sistema) return;

    const container = document.getElementById('usuariosList');
    if (!container) return;

    if (sistema.users.length === 0) {
      container.innerHTML = '<p class="empty-state">Nenhum usuário cadastrado</p>';
      return;
    }

    container.innerHTML = sistema.users.map(user => `
      <div class="usuario-card">
        <div class="usuario-info">
          <h4>${user.nome}</h4>
          <p class="usuario-username">@${user.username}</p>
          <p class="usuario-role role-${user.role}">${this.getRoleLabel(user.role)}</p>
          <p class="usuario-status status-${user.status}">${user.status}</p>
        </div>
        <div class="usuario-actions">
          ${user.username !== 'admin' ? `
            <button onclick="UsuariosModule.toggleStatus('${user.id}')" class="btn btn--sm ${user.status === 'ativo' ? 'btn--warning' : 'btn--success'}">
              ${user.status === 'ativo' ? 'Desativar' : 'Ativar'}
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');
  },

  // Obter label da role
  getRoleLabel(role) {
    const labels = {
      admin: 'Administrador',
      gerente: 'Gerente',
      operador: 'Operador'
    };
    return labels[role] || role;
  },

  // Atualizar estatísticas
  updateStats() {
    const sistema = window.sistema;
    if (!sistema) return;

    const totalUsuarios = sistema.users.length;
    const usuariosAtivos = sistema.users.filter(u => u.status === 'ativo').length;

    document.getElementById('totalUsuarios').textContent = totalUsuarios;
    document.getElementById('usuariosAtivos').textContent = usuariosAtivos;
  },

  // Mostrar modal de usuário
  showUsuarioModal() {
    const modal = Utils.createModal(
      'Novo Usuário',
      `
        <form id="usuarioForm">
          <div class="form-group">
            <label for="usuarioNome">Nome *</label>
            <input type="text" id="usuarioNome" required class="form-control">
          </div>
          <div class="form-group">
            <label for="usuarioUsername">Usuário *</label>
            <input type="text" id="usuarioUsername" required class="form-control">
          </div>
          <div class="form-group">
            <label for="usuarioSenha">Senha *</label>
            <input type="password" id="usuarioSenha" required class="form-control">
          </div>
          <div class="form-group">
            <label for="usuarioRole">Tipo *</label>
            <select id="usuarioRole" required class="form-control">
              <option value="">Selecione</option>
              <option value="gerente">Gerente</option>
              <option value="operador">Operador</option>
            </select>
          </div>
        </form>
      `,
      [
        {
          text: 'Cancelar',
          class: 'btn--secondary'
        },
        {
          text: 'Salvar',
          class: 'btn--primary',
          onClick: () => this.saveUsuario()
        }
      ]
    );
  },

  // Salvar usuário
  saveUsuario() {
    const sistema = window.sistema;
    if (!sistema) return;

    const dados = {
      nome: document.getElementById('usuarioNome').value,
      username: document.getElementById('usuarioUsername').value,
      senha: document.getElementById('usuarioSenha').value,
      role: document.getElementById('usuarioRole').value
    };

    // Validações
    if (!dados.nome || !dados.username || !dados.senha || !dados.role) {
      Utils.showToast('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    // Verificar se username já existe
    const existeUsuario = sistema.users.find(u => u.username === dados.username);
    if (existeUsuario) {
      Utils.showToast('Nome de usuário já existe', 'error');
      return;
    }

    const novoUsuario = {
      id: Utils.generateId(),
      ...dados,
      status: 'ativo',
      criadoEm: new Date().toISOString(),
      criadoPor: sistema.currentUser.id
    };

    sistema.users.push(novoUsuario);
    this.renderUsuariosList();
    this.updateStats();
    Utils.showToast('Usuário criado com sucesso!', 'success');
  },

  // Alternar status
  toggleStatus(id) {
    const sistema = window.sistema;
    if (!sistema) return;

    const usuario = sistema.users.find(u => u.id === id);
    if (usuario && usuario.username !== 'admin') {
      usuario.status = usuario.status === 'ativo' ? 'inativo' : 'ativo';
      this.renderUsuariosList();
      this.updateStats();
      Utils.showToast(`Usuário ${usuario.status === 'ativo' ? 'ativado' : 'desativado'}`, 'success');
    }
  }
};

// Tornar disponível globalmente
window.UsuariosModule = UsuariosModule;

console.log('✅ UsuariosModule carregado com sucesso!');