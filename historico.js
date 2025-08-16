// Módulo Histórico
const HistoricoModule = {
  
  // Renderizar página de histórico
  render() {
    return `
      <div class="historico-container">
        <div class="historico-header">
          <h2>Histórico de Pagamentos</h2>
          <div class="historico-controls">
            <button id="exportHistorico" class="btn btn--secondary">📊 Exportar CSV</button>
            <select id="filterTipo" class="form-control">
              <option value="">Todos os tipos</option>
              <option value="juros">Juros</option>
              <option value="quitacao">Quitação</option>
            </select>
          </div>
        </div>
        
        <div class="historico-stats">
          <div class="stat-card">
            <div class="stat-value" id="totalPagamentos">R$ 0,00</div>
            <div class="stat-label">Total Recebido</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="totalJuros">R$ 0,00</div>
            <div class="stat-label">Total em Juros</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="totalQuitacoes">R$ 0,00</div>
            <div class="stat-label">Total Quitações</div>
          </div>
        </div>
        
        <div class="historico-list" id="historicoList">
          <!-- Lista de histórico será preenchida dinamicamente -->
        </div>
      </div>
    `;
  },

  // Inicializar módulo
  init() {
    this.renderHistoricoList();
    this.updateStats();
    this.bindEvents();
  },

  // Bind de eventos
  bindEvents() {
    document.getElementById('exportHistorico')?.addEventListener('click', () => {
      this.exportarCSV();
    });

    document.getElementById('filterTipo')?.addEventListener('change', (e) => {
      this.filterHistorico(e.target.value);
    });
  },

  // Renderizar lista de histórico
  renderHistoricoList() {
    const sistema = window.sistema;
    if (!sistema) return;

    const container = document.getElementById('historicoList');
    if (!container) return;

    if (sistema.historicoPagamentos.length === 0) {
      container.innerHTML = '<p class="empty-state">Nenhum pagamento registrado</p>';
      return;
    }

    const historicoOrdenado = [...sistema.historicoPagamentos]
      .sort((a, b) => new Date(b.data) - new Date(a.data));

    container.innerHTML = historicoOrdenado.map(pag => {
      const cliente = sistema.clientes.find(c => c.id === pag.clienteId);
      const emprestimo = sistema.emprestimos.find(e => e.id === pag.emprestimoId);
      
      return `
        <div class="historico-item" data-tipo="${pag.tipo}">
          <div class="historico-info">
            <div class="historico-cliente">${cliente ? cliente.nome : 'Cliente não encontrado'}</div>
            <div class="historico-details">
              <span class="historico-tipo tipo-${pag.tipo}">${pag.tipo === 'juros' ? 'Juros' : 'Quitação'}</span>
              <span class="historico-data">${Utils.formatDateTime(pag.data)}</span>
            </div>
          </div>
          <div class="historico-valor">${Utils.formatCurrency(pag.valor)}</div>
        </div>
      `;
    }).join('');
  },

  // Atualizar estatísticas
  updateStats() {
    const sistema = window.sistema;
    if (!sistema) return;

    const totalPagamentos = sistema.historicoPagamentos
      .reduce((total, pag) => total + (pag.valor || 0), 0);
    
    const totalJuros = sistema.historicoPagamentos
      .filter(pag => pag.tipo === 'juros')
      .reduce((total, pag) => total + (pag.valor || 0), 0);
    
    const totalQuitacoes = sistema.historicoPagamentos
      .filter(pag => pag.tipo === 'quitacao')
      .reduce((total, pag) => total + (pag.valor || 0), 0);

    document.getElementById('totalPagamentos').textContent = Utils.formatCurrency(totalPagamentos);
    document.getElementById('totalJuros').textContent = Utils.formatCurrency(totalJuros);
    document.getElementById('totalQuitacoes').textContent = Utils.formatCurrency(totalQuitacoes);
  },

  // Filtrar histórico
  filterHistorico(tipo) {
    const items = document.querySelectorAll('.historico-item');
    items.forEach(item => {
      const itemTipo = item.dataset.tipo;
      const visible = !tipo || itemTipo === tipo;
      item.style.display = visible ? 'flex' : 'none';
    });
  },

  // Exportar para CSV
  exportarCSV() {
    const sistema = window.sistema;
    if (!sistema) return;

    const dados = sistema.historicoPagamentos.map(pag => {
      const cliente = sistema.clientes.find(c => c.id === pag.clienteId);
      return {
        Cliente: cliente ? cliente.nome : 'Cliente não encontrado',
        Tipo: pag.tipo === 'juros' ? 'Juros' : 'Quitação',
        Valor: pag.valor,
        Data: Utils.formatDateTime(pag.data),
        Responsavel: pag.responsavel || 'N/A'
      };
    });

    Utils.exportToCSV(dados, 'historico-pagamentos.csv');
  }
};

// Tornar disponível globalmente
window.HistoricoModule = HistoricoModule;

console.log('✅ HistoricoModule carregado com sucesso!');