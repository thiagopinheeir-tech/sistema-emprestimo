<<<<<<< HEAD
// Módulo Clientes
// ===============
=======
// clientes.js
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20

const ClientesModule = {
  editingClienteId: null,

<<<<<<< HEAD
  // Renderizar HTML da página de clientes
  render(container) {
    container.innerHTML = `
      <div class="page-header">
        <h2>Cadastro de Clientes</h2>
        <div class="page-controls">
          <button class="btn btn--primary" id="addClienteBtn">Adicionar Cliente</button>
        </div>
      </div>

      <div class="table-container">
=======
  render(container) {
    container.innerHTML = `
      <section class="page-header">
        <h2>Lista de Clientes</h2>
        <button class="btn btn--primary" id="addClienteBtn">Adicionar Cliente</button>
      </section>
      <section class="table-container">
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
        <table class="table" id="clientesTable">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nome</th>
              <th>Contato</th>
<<<<<<< HEAD
              <th>Documento</th>
              <th>Status</th>
              <th>Responsável</th>
=======
              <th>Status</th>
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
<<<<<<< HEAD
            <tr><td colspan="7">Carregando clientes...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de Cadastro/Edição -->
=======
            <tr><td colspan="5">Carregando clientes...</td></tr>
          </tbody>
        </table>
      </section>

>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
      <div id="clienteFormModal" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modalTitle">Adicionar Cliente</h3>
            <button class="btn-close" id="closeModalBtn">&times;</button>
          </div>
          <div class="modal-body">
            <form id="clienteForm">
<<<<<<< HEAD
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="nome">Nome Completo *</label>
                  <input type="text" id="nome" name="nome" class="form-control" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="contato">Contato (WhatsApp)</label>
                  <input type="text" id="contato" name="contato" class="form-control" placeholder="(11) 99999-9999" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="documento">CPF/CNPJ</label>
                  <input type="text" id="documento" name="documento" class="form-control" placeholder="000.000.000-00" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="dataNascimento">Data de Nascimento</label>
                  <input type="date" id="dataNascimento" name="dataNascimento" class="form-control" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="endereco">Endereço</label>
                <input type="text" id="endereco" name="endereco" class="form-control" placeholder="Rua, número, bairro, cidade" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="fotoUpload">Foto do Cliente</label>
                  <input type="file" id="fotoUpload" accept="image/*" class="form-control" />
                  <div style="margin-top: 10px;">
                    <img id="fotoPreview" src="https://via.placeholder.com/80x80?text=Foto" alt="Preview" style="display: block; width: 80px; height: 80px; border-radius: 8px; object-fit: cover;" />
                    <small id="fotoNoText" style="color: var(--color-text-secondary); display: none;">Nenhuma foto selecionada</small>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label" for="status">Status</label>
                  <select id="status" name="status" class="form-control">
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="observacoes">Observações</label>
                <textarea id="observacoes" name="observacoes" class="form-control" rows="3" placeholder="Informações adicionais sobre o cliente"></textarea>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn--secondary" onclick="ClientesModule.closeForm()">Cancelar</button>
                <button type="submit" class="btn btn--primary">Salvar Cliente</button>
              </div>
=======
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
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
            </form>
          </div>
        </div>
      </div>
    `;
<<<<<<< HEAD

=======
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
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
<<<<<<< HEAD

=======
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
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
<<<<<<< HEAD
      document.getElementById('documento').value = cliente.documento || '';
      document.getElementById('dataNascimento').value = cliente.dataNascimento ? Utils.formatDateForInput(cliente.dataNascimento) : '';
      document.getElementById('endereco').value = cliente.endereco || '';
      document.getElementById('status').value = cliente.status || 'ativo';
      document.getElementById('observacoes').value = cliente.observacoes || '';
      
      const fotoPreview = document.getElementById('fotoPreview');
      const fotoNoText = document.getElementById('fotoNoText');
      
      if (cliente.foto) {
        fotoPreview.src = cliente.foto;
        fotoPreview.dataset.base64 = cliente.foto;
        fotoPreview.style.display = 'block';
        fotoNoText.style.display = 'none';
      } else {
        fotoPreview.src = 'https://via.placeholder.com/80x80?text=Foto';
        fotoPreview.dataset.base64 = '';
        fotoPreview.style.display = 'block';
        fotoNoText.style.display = 'none';
      }
    } else {
      document.getElementById('clienteForm').reset();
      const fotoPreview = document.getElementById('fotoPreview');
      const fotoNoText = document.getElementById('fotoNoText');
      fotoPreview.src = 'https://via.placeholder.com/80x80?text=Foto';
      fotoPreview.dataset.base64 = '';
      fotoPreview.style.display = 'block';
      fotoNoText.style.display = 'none';
    }

=======
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
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
    Utils.toggleModal('clienteFormModal', true);
  },

  closeForm() {
    Utils.toggleModal('clienteFormModal', false);
  },

  async onSubmit(event) {
    event.preventDefault();
<<<<<<< HEAD

    const nome = document.getElementById('nome').value.trim();
    const contato = document.getElementById('contato').value.trim();
    const documento = document.getElementById('documento').value.trim();
    const dataNascimento = document.getElementById('dataNascimento').value;
    const endereco = document.getElementById('endereco').value.trim();
    const status = document.getElementById('status').value;
    const observacoes = document.getElementById('observacoes').value.trim();
=======
    const nome = document.getElementById('nome').value.trim();
    const contato = document.getElementById('contato').value.trim();
    const status = document.getElementById('status').value;
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
    const foto = document.getElementById('fotoPreview').dataset.base64 || '';

    if (!nome) {
      Utils.alert('O nome é obrigatório.', 'error');
      return;
    }

<<<<<<< HEAD
    const clienteData = {
      nome,
      contato,
      documento,
      dataNascimento,
      endereco,
      status,
      observacoes,
      foto
    };

    try {
      if (this.editingClienteId) {
        // Atualizar cliente existente
        await sistema.updateCliente(this.editingClienteId, clienteData);
        Utils.alert('Cliente atualizado com sucesso!', 'success');
      } else {
        // Criar novo cliente
        await sistema.addCliente(clienteData);
        Utils.alert('Cliente cadastrado com sucesso!', 'success');
      }

      this.closeForm();
      this.loadData();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      Utils.alert('Erro ao salvar cliente. Tente novamente.', 'error');
=======
    const clienteData = { nome, contato, status, foto };
    if (this.editingClienteId) {
      Utils.alert('Atualização de cliente não implementada nesta versão.', 'info');
    } else {
      await sistema.addCliente(clienteData);
      this.closeForm();
      this.loadData();
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
    }
  },

  loadData() {
    const tbody = document.getElementById('clientesTable').querySelector('tbody');
<<<<<<< HEAD
    const clientes = sistema.getFilteredClientes();

    if (!clientes.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--color-text-secondary);">Nenhum cliente encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = clientes.map(cliente => {
      const responsavel = sistema.users.find(u => u.id === cliente.responsavel_id);
      const canEdit = sistema.canEditClient(cliente.id);

      return `
        <tr>
          <td>
            <img src="${cliente.foto || 'https://via.placeholder.com/40x40?text=👤'}" 
                 alt="${cliente.nome}" 
                 class="client-photo" 
                 onerror="this.src='https://via.placeholder.com/40x40?text=👤'" />
          </td>
          <td><strong>${cliente.nome}</strong></td>
          <td>${cliente.contato || '-'}</td>
          <td>${cliente.documento || '-'}</td>
          <td>
            <span class="status-badge status-${cliente.status}">
              ${cliente.status.charAt(0).toUpperCase() + cliente.status.slice(1)}
            </span>
          </td>
          <td>${responsavel ? responsavel.name : '-'}</td>
          <td>
            ${canEdit ? `
              <button class="btn btn--sm btn--secondary" onclick="ClientesModule.openForm(${JSON.stringify(cliente).replace(/"/g, '&quot;')})">
                Editar
              </button>
            ` : '-'}
          </td>
        </tr>
      `;
    }).join('');
  },

  // Buscar cliente por ID
  getClienteById(id) {
    return sistema.clientes.find(c => c.id === id);
  },

  // Filtrar clientes
  filterClientes(searchTerm, status = '') {
    let clientes = sistema.getFilteredClientes();

    if (searchTerm) {
      clientes = Utils.filterByText(clientes, searchTerm, ['nome', 'contato', 'documento']);
    }

    if (status) {
      clientes = clientes.filter(c => c.status === status);
    }

    return clientes;
  }
};
=======
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
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
