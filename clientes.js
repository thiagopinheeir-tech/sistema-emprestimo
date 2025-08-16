const ClientesModule = {
  editingClienteId: null,

  render(container) {
    container.innerHTML = `
      <div class="page-header">
        <h2>Cadastro de Clientes</h2>
        <div class="page-controls">
          <button class="btn btn--primary" id="addClienteBtn">Adicionar Cliente</button>
        </div>
      </div>

      <div class="table-container">
        <table class="table" id="clientesTable">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nome</th>
              <th>Contato</th>
              <th>Documento</th>
              <th>Status</th>
              <th>Responsável</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="7">Carregando clientes...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Cliente -->
      <div id="clienteFormModal" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modalTitle">Adicionar Cliente</h3>
            <button class="btn-close" id="closeModalBtn">&times;</button>
          </div>
          <div class="modal-body">
            <form id="clienteForm">
              <div class="form-row">
                <div class="form-group">
                  <label for="nome">Nome Completo *</label>
                  <input type="text" id="nome" name="nome" class="form-control" required />
                </div>
                <div class="form-group">
                  <label for="contato">Contato (WhatsApp)</label>
                  <input type="text" id="contato" name="contato" class="form-control" placeholder="(00) 00000-0000" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="documento">CPF/CNPJ</label>
                  <input type="text" id="documento" name="documento" class="form-control" placeholder="000.000.000-00" />
                </div>
                <div class="form-group">
                  <label for="dataNascimento">Data de Nascimento</label>
                  <input type="date" id="dataNascimento" name="dataNascimento" class="form-control" />
                </div>
              </div>

              <div class="form-group">
                <label for="endereco">Endereço</label>
                <input type="text" id="endereco" name="endereco" class="form-control" placeholder="Rua, número, bairro, cidade" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="fotoUpload">Foto do Cliente</label>
                  <input type="file" id="fotoUpload" accept="image/*" class="form-control" />
                  <div style="margin-top: 10px;">
                    <img id="fotoPreview" src="https://via.placeholder.com/80" alt="Preview" />
                    <span id="fotoNoText" class="text-muted">Nenhuma foto selecionada</span>
                  </div>
                </div>
                <div class="form-group">
                  <label for="status">Status</label>
                  <select id="status" name="status" class="form-control">
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="observacoes">Observações</label>
                <textarea id="observacoes" name="observacoes" class="form-control" rows="3" placeholder="Informações adicionais"></textarea>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn--secondary" onclick="ClientesModule.closeForm()">Cancelar</button>
                <button type="submit" class="btn btn--primary">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  },

  bindEvents() {
    document.getElementById('addClienteBtn').addEventListener('click', () => this.openForm());
    document.getElementById('closeModalBtn').addEventListener('click', () => this.closeForm());
    document.getElementById('fotoUpload').addEventListener('change', this.onFotoUpload.bind(this));
    document.getElementById('clienteForm').addEventListener('submit', this.onSubmit.bind(this));
  },

  onFotoUpload(event) {
    const file = event.target.files[0];
    if (!file) {
      this.clearFotoPreview();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const fotoPreview = document.getElementById('fotoPreview');
      const fotoNoText = document.getElementById('fotoNoText');
      fotoPreview.src = reader.result;
      fotoNoText.style.display = 'none';
      fotoPreview.style.display = 'block';
      fotoPreview.dataset.base64 = reader.result;
    };
    reader.readAsDataURL(file);
  },

  clearFotoPreview() {
    const fotoPreview = document.getElementById('fotoPreview');
    const fotoNoText = document.getElementById('fotoNoText');
    fotoPreview.src = 'https://via.placeholder.com/80';
    fotoPreview.style.display = 'block';
    fotoNoText.style.display = 'inline';
  },

  openForm(cliente = null) {
    this.editingClienteId = cliente ? cliente.id : null;
    document.getElementById('modalTitle').textContent = cliente ? 'Editar Cliente' : 'Adicionar Cliente';

    if (cliente) {
      document.getElementById('nome').value = cliente.nome || '';
      document.getElementById('contato').value = cliente.contato || '';
      document.getElementById('documento').value = cliente.documento || '';
      document.getElementById('dataNascimento').value = cliente.dataNascimento || '';
      document.getElementById('endereco').value = cliente.endereco || '';
      document.getElementById('status').value = cliente.status || 'ativo';
      document.getElementById('observacoes').value = cliente.observacoes || '';
      if (cliente.foto) {
        document.getElementById('fotoPreview').src = cliente.foto;
        document.getElementById('fotoNoText').style.display = 'none';
      } else {
        this.clearFotoPreview();
      }
    } else {
      document.getElementById('clienteForm').reset();
      this.clearFotoPreview();
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('dataNascimento').value = '';
    }
    this.toggleModal(true);
  },

  closeForm() {
    this.toggleModal(false);
  },

  toggleModal(show) {
    const modal = document.getElementById('clienteFormModal');
    if (show) {
      modal.classList.remove('hidden');
    } else {
      modal.classList.add('hidden');
    }
  },

  async onSubmit(event) {
    event.preventDefault();
    // Validação simples
    const nome = document.getElementById('nome').value.trim();
    if (!nome) {
      alert('Nome é obrigatório');
      return;
    }
    const clienteData = {
      nome,
      contato: document.getElementById('contato').value.trim(),
      documento: document.getElementById('documento').value.trim(),
      dataNascimento: document.getElementById('dataNascimento').value,
      endereco: document.getElementById('endereco').value.trim(),
      foto: document.getElementById('fotoPreview').dataset.base64 || '',
      status: document.getElementById('status').value,
      observacoes: document.getElementById('observacoes').value.trim(),
      responsavel_id: sistema.currentUser.id
    };
    try {
      if (this.editingClienteId) {
        await sistema.supabase
          .from('clientes')
          .update(clienteData)
          .eq('id', this.editingClienteId);
      } else {
        await sistema.supabase
          .from('clientes')
          .insert([clienteData]);
      }
      await sistema.loadClients();
      this.closeForm();
      this.loadData();
    } catch (error) {
      alert('Erro ao salvar cliente');
      console.error(error);
    }
  },

  loadData() {
    const tbody = document.querySelector('#clientesTable tbody');
    if (!tbody) return;
    if (!sistema.currentUser) return;

    // Filtra clientes conforme papel de usuário
    let clientesVisiveis = [];
    if (sistema.currentUser.role === 'admin') {
      clientesVisiveis = sistema.clientes;
    } else if (sistema.currentUser.role === 'manager') {
      const operadores = sistema.users.filter(u => u.gerente_id === sistema.currentUser.id).map(u => u.id);
      clientesVisiveis = sistema.clientes.filter(c => operadores.includes(c.responsavel_id));
    } else if (sistema.currentUser.role === 'operator') {
      clientesVisiveis = sistema.clientes.filter(c => c.responsavel_id === sistema.currentUser.id);
    }

    if (clientesVisiveis.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">Nenhum cliente encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = clientesVisiveis.map((cliente, index) => {
      const responsavel = sistema.users.find(u => u.id === cliente.responsavel_id) || { name: '-' };
      const podeEditar =
        sistema.currentUser.role === 'admin' ||
        (sistema.currentUser.role === 'manager' && responsavel.gerente_id === sistema.currentUser.id) ||
        (sistema.currentUser.role === 'operator' && cliente.responsavel_id === sistema.currentUser.id);

      return `
        <tr>
          <td><img src="${cliente.foto || 'https://via.placeholder.com/40'}" alt="foto" style="width: 40px; height: 40px; border-radius: 50%;" onerror="this.src='https://via.placeholder.com/40'"/></td>
          <td>${cliente.nome}</td>
          <td>${cliente.contato || '-'}</td>
          <td>${cliente.documento || '-'}</td>
          <td><span class="status ${cliente.status}">${cliente.status}</span></td>
          <td>${responsavel.name}</td>
          <td>
            ${podeEditar ? `<button onclick='ClientesModule.openForm(${JSON.stringify(cliente).replace(/'/g, "\\'")})' class="btn btn--sm">Editar</button>` : '-'}
          </td>
        </tr>`;
    }).join('');
  }
};
