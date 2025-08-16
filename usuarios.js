// usuarios.js

const UsuariosModule = {
  editingUserId: null,

  render(container) {
    if (sistema.currentUser.role !== 'admin') {
      container.innerHTML = `
        <div class="no-access">
          <h3>Você não tem permissão para acessar esta página.</h3>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <section class="page-header">
        <h2>Gerenciar Usuários</h2>
        <button class="btn btn--primary" id="addUserBtn">Adicionar Usuário</button>
      </section>

      <section class="table-container">
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
      </section>

      <div id="userFormModal" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="userModalTitle">Adicionar Usuário</h3>
            <button class="btn-close" id="closeUserModalBtn">&times;</button>
          </div>
          <div class="modal-body">
            <form id="userForm">
              <div class="form-group">
                <label for="username">Usuário</label>
                <input type="text" id="username" name="username" class="form-control" required />
              </div>
              <div class="form-group">
                <label for="name">Nome Completo</label>
                <input type="text" id="name" name="name" class="form-control" required />
              </div>
              <div class="form-group">
                <label for="role">Perfil</label>
                <select id="role" name="role" class="form-control" required>
                  <option value="admin">Administrador</option>
                  <option value="manager">Gerente</option>
                  <option value="operator">Operador</option>
                </select>
              </div>
              <div class="form-group">
                <label for="gerente_id">Gerente Responsável</label>
                <select id="gerente_id" name="gerente_id" class="form-control">
                  <option value="">Nenhum</option>
                </select>
              </div>
              <div class="form-group">
                <label for="status">Status</label>
                <select id="status" name="status" class="form-control" required>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
              <div class="form-group">
                <label for="password">Senha</label>
                <input type="password" id="password" name="password" class="form-control" required />
              </div>
              <button type="submit" class="btn btn--primary btn--full-width">Salvar</button>
            </form>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.populateGerentes();
  },

  bindEvents() {
    document.getElementById('addUserBtn').addEventListener('click', () => this.openForm());
    document.getElementById('closeUserModalBtn').addEventListener('click', () => this.closeForm());
    document.getElementById('userForm').addEventListener('submit', e => this.onSubmit(e));
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
    }

    Utils.toggleModal('userFormModal', true);
  },

  closeForm() {
    Utils.toggleModal('userFormModal', false);
  },

  populateGerentes() {
    const select = document.getElementById('gerente_id');
    if (!select) return;
    select.innerHTML = '<option value="">Nenhum</option>';
    sistema.users.filter(u => u.role === 'manager' && u.status === 'ativo').forEach(gerente => {
      select.innerHTML += `<option value="${gerente.id}">${gerente.name}</option>`;
    });
  },

  async onSubmit(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const name     = document.getElementById('name').value.trim();
    const role     = document.getElementById('role').value;
    const gerente_id = document.getElementById('gerente_id').value || null;
    const status   = document.getElementById('status').value;
    const password = document.getElementById('password').value.trim();

    if (!username || !name || !password) {
      Utils.alert('Campos usuário, nome e senha são obrigatórios.', 'error');
      return;
    }

    if (this.editingUserId) {
      // **AGORA IMPLEMENTADO!**
      await sistema.supabase.from('usuarios').update({
        username,
        name,
        role,
        gerente_id,
        status,
        password
      }).eq('id', this.editingUserId);

      await sistema.loadInitialData(); // Atualiza lista local
      this.closeForm();
      this.loadData();
      Utils.alert('Usuário atualizado com sucesso!', 'info');
    } else {
      // NOVO USUÁRIO
      await sistema.supabase.from('usuarios').insert([{
        username,
        name,
        role,
        gerente_id,
        status,
        password
      }]);
      await sistema.loadInitialData(); // Atualiza lista local
      this.closeForm();
      this.loadData();
      Utils.alert('Usuário cadastrado com sucesso!', 'info');
    }
  },

  loadData() {
    const tbody = document.getElementById('usersTable').querySelector('tbody');
    const users = sistema.users;
    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="6">Nenhum usuário encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(user => {
      const gerente = sistema.users.find(u => u.id === user.gerente_id);
      return `
        <tr>
          <td>${user.username}</td>
          <td>${user.name}</td>
          <td>${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>
          <td>${gerente ? gerente.name : '-'}</td>
          <td>${user.status.charAt(0).toUpperCase() + user.status.slice(1)}</td>
          <td>
            <button class="btn btn--sm btn--outline" onclick="UsuariosModule.openForm(${JSON.stringify(user).replace(/"/g, '&quot;')})">Editar</button>
          </td>
        </tr>
      `;
    }).join('');
  }
};
