const HistoricoModule = {
  filtros: {
    cliente: '',
    tipo: '',
    dataInicio: '',
    dataFim: ''
  },

  render(container) {
    container.innerHTML = `
      <div class="page-header">
        <h2>Histórico de Pagamentos</h2>
        <div class="page-controls">
          <button class="btn btn--secondary" onclick="HistoricoModule.exportarCSV()">📊 Exportar CSV</button>
        </div>
      </div>

      <!-- Cards Estatísticos -->
      <div class="metrics-grid">
        <div class="metric-card">
          <h4>Total de Pagamentos</h4>
          <p id="totalPagamentosCount">0</p>
        </div>
        <div class="metric-card">
          <h4>Valor Total Recebido</h4>
          <p id="valorTotalRecebido">R$ 0,00</p>
        </div>
        <div class="metric-card">
          <h4>Pagamentos de Juros</h4>
          <p id="totalJuros">R$ 0,00</p>
        </div>
        <div class="metric-card">
          <h4>Quitações</h4>
          <p id="totalQuitacoes">R$ 0,00</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card">
        <div class="form-row">
          <div class="form-group">
            <label for="filtroCliente">Cliente</label>
            <select id="filtroCliente" class="form-control" onchange="HistoricoModule.onFilterChange()">
              <option value="">Todos os clientes</option>
            </select>
          </div>
          <div class="form-group">
            <label for="filtroTipo">Tipo de Pagamento</label>
            <select id="filtroTipo" class="form-control" onchange="HistoricoModule.onFilterChange()">
              <option value="">Todos os tipos</option>
              <option value="juros">Pagamento de Juros</option>
              <option value="quitacao">Quitação Total</option>
            </select>
          </div>
          <div class="form-group">
            <label for="filtroDataInicio">Data Início</label>
            <input type="date" id="filtroDataInicio" class="form-control" onchange="HistoricoModule.onFilterChange()" />
          </div>
          <div class="form-group">
            <label for="filtroDataFim">Data Fim</label>
            <input type="date" id="filtroDataFim" class="form-control" onchange="HistoricoModule.onFilterChange()" />
          </div>
          <div class="form-group">
            <button class="btn btn--secondary" onclick="HistoricoModule.limparFiltros()">Limpar Filtros</button>
          </div>
        </div>
      </div>

      <!-- Tabela do Histórico -->
      <div class="table-container">
        <table class="table" id="historicoTable">
          <thead>
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>Empréstimo</th>
              <th>Tipo</th>
              <th>Valor Pago</th>
              <th>Responsável</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="7">Carregando histórico...</td></tr>
          </tbody>
        </table>
      </div>
    `;

    this.populateClientesFiltro();
    this.setDefaultDates();
  },

  populateClientesFiltro() {
    const select = document.getElementById('filtroCliente');
    if (!select) return;
    select.innerHTML = '<option value="">Todos os clientes</option>';
    sistema.clientes.forEach(cliente => {
      select.innerHTML += `<option value="${cliente.id}">${cliente.nome}</option>`;
    });
  },

  setDefaultDates() {
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);
    document.getElementById('filtroDataInicio').value = trintaDiasAtras.toISOString().split('T')[0];
    document.getElementById('filtroDataFim').value = hoje.toISOString().split('T')[0];
  },

  onFilterChange() {
    this.filtros.cliente = document.getElementById('filtroCliente').value;
    this.filtros.tipo = document.getElementById('filtroTipo').value;
    this.filtros.dataInicio = document.getElementById('filtroDataInicio').value;
    this.filtros.dataFim = document.getElementById('filtroDataFim').value;
    this.loadData();
    this.updateStats();
  },

  limparFiltros() {
    document.getElementById('filtroCliente').value = '';
    document.getElementById('filtroTipo').value = '';
    document.getElementById('filtroDataInicio').value = '';
    document.getElementById('filtroDataFim').value = '';
    this.filtros = { cliente: '', tipo: '', dataInicio: '', dataFim: '' };
    this.loadData();
    this.updateStats();
  },

  loadData() {
    if (!sistema.currentUser) return;
    let historico = sistema.historicoPagamentos;

    if (this.filtros.cliente) {
      historico = historico.filter(h => h.cliente_id === this.filtros.cliente);
    }
    if (this.filtros.tipo) {
      historico = historico.filter(h => h.tipo === this.filtros.tipo);
    }
    if (this.filtros.dataInicio) {
      const dataInicio = new Date(this.filtros.dataInicio);
      historico = historico.filter(h => new Date(h.dataPagamento || h.created_at) >= dataInicio);
    }
    if (this.filtros.dataFim) {
      const dataFim = new Date(this.filtros.dataFim);
      dataFim.setHours(23, 59, 59, 999);
      historico = historico.filter(h => new Date(h.dataPagamento || h.created_at) <= dataFim);
    }

    const tbody = document.querySelector('#historicoTable tbody');
    if (!tbody) return;
    if (!historico.length) {
      tbody.innerHTML = '<tr><td colspan="7">Nenhum registro encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = historico.map(h => {
      const cliente = sistema.clientes.find(c => c.id === h.cliente_id) || {};
      const emprestimo = sistema.emprestimos.find(e => e.id === h.emprestimo_id) || {};
      const responsavel = sistema.users.find(u => u.id === h.responsavel_id) || {};
      const dataFormatada = new Date(h.dataPagamento || h.created_at).toLocaleDateString('pt-BR');
      const tipoLabels = { juros: 'Pagamento de Juros', quitacao: 'Quitação Total', parcial: 'Pagamento Parcial' };

      return `
        <tr>
          <td>${dataFormatada}</td>
          <td>${cliente.nome || '-'}</td>
          <td>${emprestimo.valorPrincipal ? 'R$ ' + emprestimo.valorPrincipal.toFixed(2) : '-'}</td>
          <td><span class="status">${tipoLabels[h.tipo] || h.tipo}</span></td>
          <td>R$ ${parseFloat(h.valor).toFixed(2)}</td>
          <td>${responsavel.name || '-'}</td>
          <td><button class="btn btn--sm" onclick="HistoricoModule.showDetalhes('${h.id}')">Detalhes</button></td>
        </tr>
      `;
    }).join('');
  },

  updateStats() {
    const historico = sistema.historicoPagamentos;
    const totalPagamentos = historico.length;
    const valorTotal = historico.reduce((acc, h) => acc + (parseFloat(h.valor) || 0), 0);
    const juros = historico.filter(h => h.tipo === 'juros').reduce((acc, h) => acc + (parseFloat(h.valor) || 0), 0);
    const quitacoes = historico.filter(h => h.tipo === 'quitacao').reduce((acc, h) => acc + (parseFloat(h.valor) || 0), 0);

    document.getElementById('totalPagamentosCount').textContent = totalPagamentos;
    document.getElementById('valorTotalRecebido').textContent = `R$ ${valorTotal.toFixed(2)}`;
    document.getElementById('totalJuros').textContent = `R$ ${juros.toFixed(2)}`;
    document.getElementById('totalQuitacoes').textContent = `R$ ${quitacoes.toFixed(2)}`;
  },

  showDetalhes(id) {
    const registro = sistema.historicoPagamentos.find(h => h.id === id);
    if (!registro) {
      alert('Registro não encontrado.');
      return;
    }
    alert(`Detalhes:\nCliente: ${registro.cliente_id}\nValor: R$ ${parseFloat(registro.valor).toFixed(2)}\nTipo: ${registro.tipo}`);
  }
};
