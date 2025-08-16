// Módulo Usuários (Admin Only)
// =============================

const UsuariosModule = {
  editingUserId: null,

  // Renderizar HTML da página de usuários
  render(container) {
    if (sistema.currentUser.role !== 'admin') {
      container.innerHTML = `
        <div class="no-access" style="text-align: center; padding: 40px;">
          <h3>Você não tem permissão para acessar esta página.</h3>
          <p style="color: var(--color-text-secondary);">Esta funcionalidade é exclusiva para administradores.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="page-header">
        <h2>Gerenciamento de Usuários</h2>
        <div class="page-controls">
          <button class="btn btn--primary" id="addUserBtn">Adicionar Usuário</button>
        </div>
      </div>

      <!-- Cards de Estatísticas -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="card">
          <div class="card__body" style="text-align: center;">
            <h4 style="color: var(--color-text-secondary); margin: 0 0 8px 0;">Total de Usuários</h4>
            <p style="font-size: 24px; font-weight: 600; margin: 0;" id="totalUsers">0</p>
          </div>
        </div>
        <div class="card">
          <div class="card__body" style="text-align: center;">
            <h4 style="color: var(--color-text-secondary); margin: 0 0 8px 0;">Administradores</h4>
            <p style="font-size: 24px; font-weight: 600; margin: 0;" id="totalAdmins">0</p>
          </div>
        </div>
        <div class="card">
          <div class="card__body" style="text-align: center;">
            <h4 style="color: var(--color-text-secondary); margin: 0 0 8px 0;">Gerentes</h4>
            <p style="font-size: 24px; font-weight: 600; margin: 0;" id="totalManagers">0</p>
          </div>
        </div>
        <div class="card">
          <div class="card__body" style="text-align: center;">
            <h4 style="color: var(--color-text-secondary); margin: 0 0 8px 0;">Operadores</h4>
            <p style="font-size: 24px; font-weight: 600; margin: 0;" id="totalOperators">0</p>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="table" id="usersTable">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Nome Completo</th>
              <th>Perfil</th>
              <th>Gerente</th>
              <th>Status</th>
              <th>Clientes</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="7">Carregando usuários...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de Cadastro/Edição -->
      <div id="userFormModal" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="userModalTitle">Adicionar Usuário</h3>
            <button class="btn-close" id="closeUserModalBtn">&times;</button>
          </div>
          <div class="modal-body">
            <form id="userForm">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="username">Nome de Usuário *</label>
                  <input type="text" id="username" name="username" class="form-control" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="name">Nome Completo *</label>
                  <input type="text" id="name" name="name" class="form-control" required />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="role">Perfil *</label>
                  <select id="role" name="role" class="form-control" required>
                    <option value="admin">Administrador</option>
                    <option value="manager">Gerente</option>
                    <option value="operator">Operador</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="gerente_id">Gerente Responsável</label>
                  <select id="gerente_id" name="gerente_id" class="form-control">
                    <option value="">Nenhum</option>
                  </select>
                  <small style="color: var(--color-text-secondary);">Obrigatório apenas para operadores</small>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="password">Senha *</label>
                  <input type="password" id="password" name="password" class="form-control" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="status">Status *</label>
                  <select id="status" name="status" class="form-control" required>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn--secondary" onclick="UsuariosModule.closeForm()">Cancelar</button>
                <button type="submit" class="btn btn--primary">Salvar Usuário</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.populateGerentes();
    this.updateStats();
  },

  bindEvents() {
    document.getElementById('addUserBtn').addEventListener('click', () => this.openForm());
    document.getElementById('closeUserModalBtn').addEventListener('click', () => this.closeForm());
    document.getElementById('userForm').addEventListener('submit', e => this.onSubmit(e));
    
    // Esconder/mostrar campo gerente baseado no role
    document.getElementById('role').addEventListener('change', this.onRoleChange);
  },

  onRoleChange() {
    const role = document.getElementById('role').value;
    const gerenteGroup = document.getElementById('gerente_id').closest('.form-group');
    
    if (role === 'operator') {
      gerenteGroup.style.display = 'block';
      document.getElementById('gerente_id').required = true;
    } else {
      gerenteGroup.style.display = 'none';
      document.getElementById('gerente_id').required = false;
      document.getElementById('gerente_id').value = '';
    }
  },

  openForm(user = null) {
    this.editingUserId = user ? user.id : null;
    const modalTitle = document.getElementById('userModalTitle');
    modalTitle.textContent = user ? 'Editar Usuário' : 'Adicionar Usuário';

    if (user) {
      document.getElementById('username').value = user.username || '';
      document.getElementById('name').value = user.name || '';
      document.getElementById('role').value = user.role || 'operator';
      document.getElementById('gerente_id').value = user.gerente_id || '';
      document.getElementById('status').value = user.status || 'ativo';
      document.getElementById('password').value = user.password || '';
    } else {
      document.getElementById('userForm').reset();
      document.getElementById('role').value = 'operator';
    }

    this.populateGerentes();
    this.onRoleChange(); // Aplicar lógica de exibição do campo gerente
    Utils.toggleModal('userFormModal', true);
  },

  closeForm() {
    Utils.toggleModal('userFormModal', false);
  },

  populateGerentes() {
    const select = document.getElementById('gerente_id');
    if (!select) return;

    select.innerHTML = '<option value="">Nenhum</option>';
    
    const gerentes = sistema.users.filter(u => u.role === 'manager' && u.status === 'ativo');
    gerentes.forEach(gerente => {
      select.innerHTML += `<option value="${gerente.id}">${gerente.name}</option>`;
    });
  },

  async onSubmit(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const name = document.getElementById('name').value.trim();
    const role = document.getElementById('role').value;
    const gerente_id = document.getElementById('gerente_id').value || null;
    const status = document.getElementById('status').value;
    const password = document.getElementById('password').value.trim();

    if (!username || !name || !password) {
      Utils.alert('Campos usuário, nome e senha são obrigatórios.', 'error');
      return;
    }

    if (role === 'operator' && !gerente_id) {
      Utils.alert('Operadores devem ter um gerente responsável.', 'error');
      return;
    }

    const userData = {
      username,
      name,
      role,
      gerente_id,
      status,
      password
    };

    try {
      if (this.editingUserId) {
        // Atualizar usuário existente
        await sistema.supabase.from('usuarios')
          .update(userData)
          .eq('id', this.editingUserId);
        
        Utils.alert('Usuário atualizado com sucesso!', 'success');
      } else {
        // Verificar se username já existe
        const { data: existing } = await sistema.supabase
          .from('usuarios')
          .select('id')
          .eq('username', username)
          .single();

        if (existing) {
          Utils.alert('Nome de usuário já existe. Escolha outro.', 'error');
          return;
        }

        // Criar novo usuário
        await sistema.supabase.from('usuarios')
          .insert([userData]);
        
        Utils.alert('Usuário cadastrado com sucesso!', 'success');
      }

      await sistema.loadUsers(); // Recarregar dados
      this.closeForm();
      this.loadData();
      this.updateStats();

    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      Utils.alert('Erro ao salvar usuário. Tente novamente.', 'error');
    }
  },

  loadData() {
    const tbody = document.getElementById('usersTable').querySelector('tbody');
    const users = sistema.users;

    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--color-text-secondary);">Nenhum usuário encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(user => {
      const gerente = sistema.users.find(u => u.id === user.gerente_id);
      const clientesDoUsuario = this.getClientesCount(user.id, user.role);
      
      const roleNames = {
        'admin': 'Administrador',
        'manager': 'Gerente',
        'operator': 'Operador'
      };

      return `
        <tr>
          <td><strong>${user.username}</strong></td>
          <td>${user.name}</td>
          <td>
            <span class="status-badge status-${user.role === 'admin' ? 'warning' : (user.role === 'manager' ? 'info' : 'success')}">
              ${roleNames[user.role] || user.role}
            </span>
          </td>
          <td>${gerente ? gerente.name : '-'}</td>
          <td>
            <span class="status-badge status-${user.status}">
              ${user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </span>
          </td>
          <td><strong>${clientesDoUsuario}</strong></td>
          <td>
            <button class="btn btn--sm btn--secondary" onclick="UsuariosModule.openForm(${JSON.stringify(user).replace(/"/g, '&quot;')})">
              Editar
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  getClientesCount(userId, userRole) {
    if (userRole === 'admin') {
      return sistema.clientes.length;
    } else if (userRole === 'manager') {
      // Contar clientes de operadores subordinados
      const operadores = sistema.users.filter(u => u.gerente_id === userId);
      const operadorIds = operadores.map(op => op.id);
      return sistema.clientes.filter(c => operadorIds.includes(c.responsavel_id)).length;
    } else if (userRole === 'operator') {
      return sistema.clientes.filter(c => c.responsavel_id === userId).length;
    }
    return 0;
  },

  updateStats() {
    const users = sistema.users;
    
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalAdmins').textContent = users.filter(u => u.role === 'admin').length;
    document.getElementById('totalManagers').textContent = users.filter(u => u.role === 'manager').length;
    document.getElementById('totalOperators').textContent = users.filter(u => u.role === 'operator').length;
  },

  // Buscar usuário por ID
  getUserById(id) {
    return sistema.users.find(u => u.id === id);
  },

  // Obter hierarquia de usuários
  getUserHierarchy(userId) {
    const user = this.getUserById(userId);
    if (!user) return [];

    const hierarchy = [user];
    
    if (user.role === 'manager') {
      // Adicionar operadores subordinados
      const operadores = sistema.users.filter(u => u.gerente_id === userId);
      hierarchy.push(...operadores);
    }

    return hierarchy;
  }
};