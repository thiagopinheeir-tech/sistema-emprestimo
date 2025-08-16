// clientes.js

const ClientesModule = {
  editingClienteId: null,

  render(container) {
    container.innerHTML = `
      <section class="page-header">
        <h2>Lista de Clientes</h2>
        <button class="btn btn--primary" id="addClienteBtn">Adicionar Cliente</button>
      </section>
      <section class="table-container">
        <table class="table" id="clientesTable">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nome</th>
              <th>Contato</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="5">Carregando clientes...</td></tr>
          </tbody>
        </table>
      </section>

      <div id="clienteFormModal" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modalTitle">Adicionar Cliente</h3>
            <button class="btn-close" id="closeModalBtn">&times;</button>
          </div>
          <div class="modal-body">
            <form id="clienteForm">
              <div class="form-group">
                <label for="nome">Nome</label>
                <input type="text" id="nome" name="nome" class="form-control" required />
              </div>
              <div class="form-group">
                <label for="contato">Contato (WhatsApp)</label>
                <input type="text" id="contato" name="contato" class="form-control" />
              </div>
              <div class="form-group">
                <label for="fotoUpload">Foto</label>
                <input type="file" id="fotoUpload" accept="image/*" class="form-control" />
                <div style="margin-top:.5em;">
                  <img id="fotoPreview" src="https://via.placeholder.com/60x60?text=Foto" alt="Pré-visualização" style="display:block;max-width:60px;border-radius:8px;" />
                  <span class="fotoNoText" id="fotoNoText" style="color:#aaa;font-size:.95em;">Nenhuma foto selecionada</span>
                </div>
              </div>
              <div class="form-group">
                <label for="status">Status</label>
                <select id="status" name="status" class="form-control">
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
              <button type="submit" class="btn btn--primary btn--full-width">Salvar</button>
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
    document.getElementById('fotoUpload').addEventListener('change', this.onFotoUpload);
    document.getElementById('clienteForm').addEventListener('submit', e => this.onSubmit(e));
  },

  onFotoUpload(e) {
    const file = e.target.files[0];
    if (!file) {
      Utils.previewPhoto('', 'fotoPreview', 'fotoNoText');
      return;
    }
    Utils.convertToBase64(file, base64 => {
      document.getElementById('fotoPreview').src = base64;
      document.getElementById('fotoNoText').style.display = 'none';
      document.getElementById('fotoPreview').style.display = 'block';
      document.getElementById('fotoPreview').dataset.base64 = base64;
    });
  },

  openForm(cliente = null) {
    this.editingClienteId = cliente ? cliente.id : null;
    document.getElementById('modalTitle').textContent = cliente ? 'Editar Cliente' : 'Adicionar Cliente';

    if (cliente) {
      document.getElementById('nome').value = cliente.nome || '';
      document.getElementById('contato').value = cliente.contato || '';
      document.getElementById('status').value = cliente.status || 'ativo';
      document.getElementById('fotoPreview').src = cliente.foto || 'https://via.placeholder.com/60x60?text=Foto';
      document.getElementById('fotoPreview').dataset.base64 = cliente.foto || '';
      document.getElementById('fotoNoText').style.display = cliente.foto ? 'none' : 'block';
    } else {
      document.getElementById('clienteForm').reset();
      document.getElementById('fotoPreview').src = 'https://via.placeholder.com/60x60?text=Foto';
      document.getElementById('fotoPreview').dataset.base64 = '';
      document.getElementById('fotoNoText').style.display = 'block';
    }
    Utils.toggleModal('clienteFormModal', true);
  },

  closeForm() {
    Utils.toggleModal('clienteFormModal', false);
  },

  async onSubmit(event) {
    event.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const contato = document.getElementById('contato').value.trim();
    const status = document.getElementById('status').value;
    const foto = document.getElementById('fotoPreview').dataset.base64 || '';

    if (!nome) {
      Utils.alert('O nome é obrigatório.', 'error');
      return;
    }

    const clienteData = { nome, contato, status, foto };
    if (this.editingClienteId) {
      Utils.alert('Atualização de cliente não implementada nesta versão.', 'info');
    } else {
      await sistema.addCliente(clienteData);
      this.closeForm();
      this.loadData();
    }
  },

  loadData() {
    const tbody = document.getElementById('clientesTable').querySelector('tbody');
    if (!sistema.clientes.length) {
      tbody.innerHTML = '<tr><td colspan="5">Nenhum cliente encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = sistema.clientes.map(cliente => `
      <tr>
        <td><img src="${cliente.foto || 'https://via.placeholder.com/40'}" alt="${cliente.nome}" width="40" height="40" style="border-radius:8px;" /></td>
        <td>${cliente.nome}</td>
        <td>${cliente.contato || '-'}</td>
        <td><span class="status-badge status-${cliente.status}">${cliente.status.charAt(0).toUpperCase() + cliente.status.slice(1)}</span></td>
        <td>
          <button class="btn btn--sm btn--outline" onclick="ClientesModule.openForm(${JSON.stringify(cliente).replace(/"/g, '&quot;')})">Editar</button>
        </td>
      </tr>
    `).join('');
  }
};
