// Módulo Empréstimos
const EmprestimosModule = {
  
  // Renderizar página de empréstimos
  render() {
    return `
      <div class="emprestimos-container">
        <div class="emprestimos-header">
          <h2>Gestão de Empréstimos</h2>
          <div class="emprestimos-controls">
            <button id="addEmprestimo" class="btn btn--primary">+ Novo Empréstimo</button>
            <select id="filterStatus" class="form-control">
              <option value="">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="quitado">Quitados</option>
            </select>
          </div>
        </div>
        
        <div class="emprestimos-list" id="emprestimosList">
          <!-- Lista de empréstimos será preenchida dinamicamente -->
        </div>
      </div>
    `;
  },

  // Inicializar módulo
  init() {
    this.renderEmprestimosList();
    this.bindEvents();
  },

  // Bind de eventos
  bindEvents() {
    document.getElementById('addEmprestimo')?.addEventListener('click', () => {
      this.showEmprestimoModal();
    });

    document.getElementById('filterStatus')?.addEventListener('change', (e) => {
      this.filterEmprestimos(e.target.value);
    });
  },

  // Renderizar lista
  renderEmprestimosList() {
    const sistema = window.sistema;
    if (!sistema) return;

    const container = document.getElementById('emprestimosList');
    if (!container) return;

    if (sistema.emprestimos.length === 0) {
      container.innerHTML = '<p class="empty-state">Nenhum empréstimo cadastrado</p>';
      return;
    }

    container.innerHTML = sistema.emprestimos.map(emp => {
      const cliente = sistema.clientes.find(c => c.id === emp.clienteId);
      return `
        <div class="emprestimo-card" data-status="${emp.status}">
          <div class="emprestimo-info">
            <h4>${cliente ? cliente.nome : 'Cliente não encontrado'}</h4>
            <p>Valor: ${Utils.formatCurrency(emp.valor)}</p>
            <p>Juros: ${emp.juros}% ao mês</p>
            <p class="emprestimo-status status-${emp.status}">${emp.status}</p>
          </div>
          <div class="emprestimo-actions">
            ${emp.status === 'ativo' ? `
              <button onclick="EmprestimosModule.pagarJuros('${emp.id}')" class="btn btn--sm btn--success">Pagar Juros</button>
              <button onclick="EmprestimosModule.quitarEmprestimo('${emp.id}')" class="btn btn--sm btn--warning">Quitar</button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  // Filtrar empréstimos
  filterEmprestimos(status) {
    const cards = document.querySelectorAll('.emprestimo-card');
    cards.forEach(card => {
      const cardStatus = card.dataset.status;
      const visible = !status || cardStatus === status;
      card.style.display = visible ? 'block' : 'none';
    });
  },

  // Mostrar modal de empréstimo
  showEmprestimoModal() {
    const sistema = window.sistema;
    if (!sistema) return;

    const clientesOptions = sistema.clientes
      .filter(c => c.status === 'ativo')
      .map(c => `<option value="${c.id}">${c.nome}</option>`)
      .join('');

    const modal = Utils.createModal(
      'Novo Empréstimo',
      `
        <form id="emprestimoForm">
          <div class="form-group">
            <label for="emprestimoCliente">Cliente *</label>
            <select id="emprestimoCliente" required class="form-control">
              <option value="">Selecione um cliente</option>
              ${clientesOptions}
            </select>
          </div>
          <div class="form-group">
            <label for="emprestimoValor">Valor *</label>
            <input type="number" id="emprestimoValor" required class="form-control" step="0.01" min="0">
          </div>
          <div class="form-group">
            <label for="emprestimoJuros">Juros (% ao mês) *</label>
            <input type="number" id="emprestimoJuros" required class="form-control" step="0.1" min="0">
          </div>
          <div class="form-group">
            <label for="emprestimoObservacoes">Observações</label>
            <textarea id="emprestimoObservacoes" class="form-control"></textarea>
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
          onClick: () => this.saveEmprestimo()
        }
      ]
    );
  },

  // Salvar empréstimo
  saveEmprestimo() {
    const sistema = window.sistema;
    if (!sistema) return;

    const dados = {
      clienteId: document.getElementById('emprestimoCliente').value,
      valor: parseFloat(document.getElementById('emprestimoValor').value),
      juros: parseFloat(document.getElementById('emprestimoJuros').value),
      observacoes: document.getElementById('emprestimoObservacoes').value
    };

    if (!dados.clienteId || !dados.valor || !dados.juros) {
      Utils.showToast('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    const emprestimo = {
      id: Utils.generateId(),
      ...dados,
      status: 'ativo',
      criadoEm: new Date().toISOString(),
      proximoVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      responsavel: sistema.currentUser.id
    };

    sistema.emprestimos.push(emprestimo);
    this.renderEmprestimosList();
    Utils.showToast('Empréstimo cadastrado com sucesso!', 'success');
  },

  // Pagar juros
  pagarJuros(id) {
    const sistema = window.sistema;
    if (!sistema) return;

    const emprestimo = sistema.emprestimos.find(e => e.id === id);
    if (!emprestimo) return;

    const valorJuros = emprestimo.valor * (emprestimo.juros / 100);
    
    const pagamento = {
      id: Utils.generateId(),
      emprestimoId: id,
      clienteId: emprestimo.clienteId,
      tipo: 'juros',
      valor: valorJuros,
      data: new Date().toISOString(),
      responsavel: sistema.currentUser.id
    };

    sistema.historicoPagamentos.push(pagamento);
    
    // Atualizar próximo vencimento
    emprestimo.proximoVencimento = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    Utils.showToast(`Juros de ${Utils.formatCurrency(valorJuros)} registrado!`, 'success');
  },

  // Quitar empréstimo
  quitarEmprestimo(id) {
    const sistema = window.sistema;
    if (!sistema) return;

    Utils.confirm(
      'Tem certeza que deseja quitar este empréstimo?',
      () => {
        const emprestimo = sistema.emprestimos.find(e => e.id === id);
        if (emprestimo) {
          emprestimo.status = 'quitado';
          emprestimo.quitadoEm = new Date().toISOString();
          
          const pagamento = {
            id: Utils.generateId(),
            emprestimoId: id,
            clienteId: emprestimo.clienteId,
            tipo: 'quitacao',
            valor: emprestimo.valor,
            data: new Date().toISOString(),
            responsavel: sistema.currentUser.id
          };
          
          sistema.historicoPagamentos.push(pagamento);
          this.renderEmprestimosList();
          Utils.showToast('Empréstimo quitado com sucesso!', 'success');
        }
      }
    );
  }
};

// Tornar disponível globalmente
window.EmprestimosModule = EmprestimosModule;

console.log('✅ EmprestimosModule carregado com sucesso!');