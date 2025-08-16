// Módulo Clientes
const ClientesModule = {
  
  // Renderizar página de clientes
  render() {
    return `
      <div class="clientes-container">
        <div class="clientes-header">
          <h2>Gestão de Clientes</h2>
          <div class="clientes-controls">
            <button id="addCliente" class="btn btn--primary">+ Novo Cliente</button>
            <input type="text" id="searchClientes" placeholder="Buscar cliente..." class="form-control" style="width: 200px;">
          </div>
        </div>
        
        <div class="clientes-list" id="clientesList">
          <!-- Lista de clientes será preenchida dinamicamente -->
        </div>
      </div>

      <!-- Modal para adicionar/editar cliente -->
      <div id="clienteModal" class="modal hidden">
        <div class="modal-content">
          <h3 id="clienteModalTitle">Novo Cliente</h3>
          <form id="clienteForm">
            <div class="form-group">
              <label for="clienteNome">Nome *</label>
              <input type="text" id="clienteNome" required class="form-control">
            </div>
            <div class="form-group">
              <label for="clienteContato">Contato</label>
              <input type="tel" id="clienteContato" class="form-control">
            </div>
            <div class="form-group">
              <label for="clienteDocumento">CPF</label>
              <input type="text" id="clienteDocumento" class="form-control">
            </div>
            <div class="form-group">
              <label for="clienteEndereco">Endereço</label>
              <textarea id="clienteEndereco" class="form-control"></textarea>
            </div>
            <div class="form-group">
              <label for="clienteObservacoes">Observações</label>
              <textarea id="clienteObservacoes" class="form-control"></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" id="cancelCliente" class="btn btn--secondary">Cancelar</button>
              <button type="submit" class="btn btn--primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  // Inicializar módulo
  init() {
    this.renderClientesList();
    this.bindEvents();
  },

  // Bind de eventos
  bindEvents() {
    // Novo cliente
    document.getElementById('addCliente')?.addEventListener('click', () => {
      this.showClienteModal();
    });

    // Busca
    document.getElementById('searchClientes')?.addEventListener('input', (e) => {
      this.searchClientes(e.target.value);
    });

    // Modal
    document.getElementById('cancelCliente')?.addEventListener('click', () => {
      this.hideClienteModal();
    });

    // Formulário
    document.getElementById('clienteForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCliente();
    });
  },

  // Renderizar lista de clientes
  renderClientesList() {
    const sistema = window.sistema;
    if (!sistema) return;

    const container = document.getElementById('clientesList');
    if (!container) return;

    if (sistema.clientes.length === 0) {
      container.innerHTML = '<p class="empty-state">Nenhum cliente cadastrado</p>';
      return;
    }

    container.innerHTML = sistema.clientes.map(cliente => `
      <div class="cliente-card" data-id="${cliente.id}">
        <div class="cliente-info">
          <h4>${cliente.nome}</h4>
          <p>${cliente.contato || 'Sem contato'}</p>
          <p class="cliente-status status-${cliente.status}">${cliente.status}</p>
        </div>
        <div class="cliente-actions">
          <button onclick="ClientesModule.editCliente('${cliente.id}')" class="btn btn--sm btn--secondary">Editar</button>
          <button onclick="ClientesModule.toggleStatus('${cliente.id}')" class="btn btn--sm ${cliente.status === 'ativo' ? 'btn--warning' : 'btn--success'}">
            ${cliente.status === 'ativo' ? 'Desativar' : 'Ativar'}
          </button>
        </div>
      </div>
    `).join('');
  },

  // Buscar clientes
  searchClientes(term) {
    const cards = document.querySelectorAll('.cliente-card');
    cards.forEach(card => {
      const nome = card.querySelector('h4').textContent.toLowerCase();
      const visible = nome.includes(term.toLowerCase());
      card.style.display = visible ? 'flex' : 'none';
    });
  },

  // Mostrar modal
  showClienteModal(cliente = null) {
    const modal = document.getElementById('clienteModal');
    const title = document.getElementById('clienteModalTitle');
    
    if (cliente) {
      title.textContent = 'Editar Cliente';
      this.fillForm(cliente);
    } else {
      title.textContent = 'Novo Cliente';
      document.getElementById('clienteForm').reset();
    }
    
    modal.classList.remove('hidden');
  },

  // Esconder modal
  hideClienteModal() {
    document.getElementById('clienteModal').classList.add('hidden');
  },

  // Preencher formulário
  fillForm(cliente) {
    document.getElementById('clienteNome').value = cliente.nome || '';
    document.getElementById('clienteContato').value = cliente.contato || '';
    document.getElementById('clienteDocumento').value = cliente.documento || '';
    document.getElementById('clienteEndereco').value = cliente.endereco || '';
    document.getElementById('clienteObservacoes').value = cliente.observacoes || '';
  },

  // Salvar cliente
  async saveCliente() {
    const sistema = window.sistema;
    if (!sistema) return;

    const dados = {
      nome: document.getElementById('clienteNome').value,
      contato: document.getElementById('clienteContato').value,
      documento: document.getElementById('clienteDocumento').value,
      endereco: document.getElementById('clienteEndereco').value,
      observacoes: document.getElementById('clienteObservacoes').value
    };

    try {
      // Validações básicas
      if (!dados.nome) {
        Utils.showToast('Nome é obrigatório', 'error');
        return;
      }

      const clienteId = Utils.generateId();
      const novoCliente = {
        id: clienteId,
        ...dados,
        status: 'ativo',
        criadoEm: new Date().toISOString(),
        responsavel: sistema.currentUser.id
      };

      sistema.clientes.push(novoCliente);
      
      this.renderClientesList();
      this.hideClienteModal();
      Utils.showToast('Cliente salvo com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      Utils.showToast('Erro ao salvar cliente', 'error');
    }
  },

  // Editar cliente
  editCliente(id) {
    const sistema = window.sistema;
    if (!sistema) return;

    const cliente = sistema.clientes.find(c => c.id === id);
    if (cliente) {
      this.showClienteModal(cliente);
    }
  },

  // Alternar status
  toggleStatus(id) {
    const sistema = window.sistema;
    if (!sistema) return;

    const cliente = sistema.clientes.find(c => c.id === id);
    if (cliente) {
      cliente.status = cliente.status === 'ativo' ? 'inativo' : 'ativo';
      this.renderClientesList();
      Utils.showToast(`Cliente ${cliente.status === 'ativo' ? 'ativado' : 'desativado'}`, 'success');
    }
  }
};

// Tornar disponível globalmente
window.ClientesModule = ClientesModule;

console.log('✅ ClientesModule carregado com sucesso!');