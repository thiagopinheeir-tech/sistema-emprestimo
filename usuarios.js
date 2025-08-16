const UsuariosModule = {
  editingUserId: null,

  render(container) {
    if (!sistema.currentUser || sistema.currentUser.role !== 'admin') {
      container.innerHTML = `
        <div style="padding: 40px; text-align: center;">
          <h3>Esta funcionalidade é exclusiva para administradores.</h3>
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
      <div class="metrics-grid">
        <div class="metric-card">
          <h4>Total de Usuários</h4>
          <p id="totalUsers">0</p>
        </div>
        <div class="metric-card">
          <h4>Administradores</h4>
          <p id="totalAdmins">0</p>
        </div>
        <div class="metric-card">
          <h4>Gerentes</h4>
          <p id="totalManagers">0</p>
        </div>
        <div class="metric-card">
          <h4>Operadores</h4>
          <p id="totalOperators">0</p>
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
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="6">Carregando usuários...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Usuário -->
      <div id="userFormModal" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="userModalTitle">Adicionar Usuário</h3>
            <button class="btn-close" id="closeUserModalBtn">&times;</button>
          </div>
          <div class="modal-body">
            <form id="userForm">
              <div class="form-group">
                <label for="username">Nome de Usuário *</label>
                <input type="text" id="username" name="username" required class="form-control" />
              </div>
              <div class="form-group">
                <label for="name">Nome Completo *</label>
                <input type="text" id="name" name="name" required class="form-control" />
              </div>
              <div class="form-group">
                <label for="role">Perfil *</label>
                <select id="role" name="role" required class="form-control">
                  <option value="admin">Administrador</option>
                  <option value="manager">Gerente</option>
                  <option value="operator">Operador</option>
                </select>
              </div>
              <div class="form-group" id="gerenteGroup" style="display:none;">
                <label for="gerente_id">Gerente Responsável</label>
                <select id="gerente_id" name="gerente_id" class="form-control">
                  <option value="">Nenhum</option>
                </select>
                <small>Apenas para operadores</small>
              </div>
              <div class="form-group">
                <label for="password">Senha *</label>
                <input type="password" id="password" name="password" required class="form-control" />
              </div>
              <div class="form-group">
                <label for="status">Status *</label>
                <select id="status" name="status" required class="form-control">
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
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
    document.getElementById('role').addEventListener('change', () => this.onRoleChange());
  },

  onRoleChange() {
    const role = document.getElementById('role').value;
    const gerenteGroup = document.getElementById('gerenteGroup');
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
    document.getElementById('userModalTitle').textContent = user ? 'Editar Usuário' : 'Adicionar Usuário';

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
    this.onRoleChange();
    this.toggleModal(true);
  },

  closeForm() {
    this.toggleModal(false);
  },

  toggleModal(show) {
    const modal = document.getElementById('userFormModal');
    if (show) modal.classList.remove('hidden');
    else modal.classList.add('hidden');
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
      alert('Usuário, nome e senha são obrigatórios.');
      return;
    }
    if (role === 'operator' && !gerente_id) {
      alert('Operadores devem ter um gerente responsável.');
      return;
    }

    const userData = { username, name, role, gerente_id, status, password };
    try {
      if (this.editingUserId) {
        await sistema.supabase.from('usuarios').update(userData).eq('id', this.editingUserId);
      } else {
        const { data: existingUser } = await sistema.supabase
          .from('usuarios').select('id').eq('username', username).single();
        if (existingUser) {
          alert('Nome de usuário já existe.');
          return;
        }
        await sistema.supabase.from('usuarios').insert([userData]);
      }
      await sistema.loadUsers();
      this.closeForm();
      this.loadData();
      this.updateStats();
    } catch (error) {
      alert('Erro ao salvar usuário.');
      console.error(error);
    }
  },

  loadData() {
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;
    if (!sistema.currentUser) return;

    const usersVisiveis = sistema.users.filter(u => {
      if (sistema.currentUser.role === 'admin') return true;
      if (sistema.currentUser.role === 'manager') {
        // gerente pode ver operadores associados
        return u.gerente_id === sistema.currentUser.id || u.id === sistema.currentUser.id;
      }
      // operador vê só ele mesmo
      return u.id === sistema.currentUser.id;
    });

    if (usersVisiveis.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">Nenhum usuário encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = usersVisiveis.map(user => {
      return `
      <tr>
        <td>${user.username}</td>
        <td>${user.name}</td>
        <td>${user.role}</td>
        <td>${user.gerente_id || '-'}</td>
        <td>${user.status}</td>
        <td><button class="btn btn--sm" onclick='UsuariosModule.openForm(${JSON.stringify(user).replace(/'/g, "\\'")})'>Editar</button></td>
      </tr>
      `;
    }).join('');
  },

  updateStats() {
    const users = sistema.users;
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalAdmins').textContent = users.filter(u => u.role === 'admin').length;
    document.getElementById('totalManagers').textContent = users.filter(u => u.role === 'manager').length;
    document.getElementById('totalOperators').textContent = users.filter(u => u.role === 'operator').length;
  },
};
