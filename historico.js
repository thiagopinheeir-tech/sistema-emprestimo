// Módulo Histórico Profissional - Versão 2.0

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

      <!-- Cards de Estatísticas -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="card">
          <div class="card__body" style="text-align: center;">
            <h4 style="color: var(--color-text-secondary); margin: 0 0 8px 0;">Total de Pagamentos</h4>
            <p style="font-size: 24px; font-weight: 600; margin: 0;" id="totalPagamentosCount">0</p>
          </div>
        </div>
        <div class="card">
          <div class="card__body" style="text-align: center;">
            <h4 style="color: var(--color-text-secondary); margin: 0 0 8px 0;">Valor Total Recebido</h4>
            <p style="font-size: 24px; font-weight: 600; margin: 0;" id="valorTotalRecebido">R$ 0,00</p>
          </div>
        </div>
        <div class="card">
          <div class="card__body" style="text-align: center;">
            <h4 style="color: var(--color-text-secondary); margin: 0 0 8px 0;">Pagamentos de Juros</h4>
            <p style="font-size: 24px; font-weight: 600; margin: 0;" id="totalJuros">R$ 0,00</p>
          </div>
        </div>
        <div class="card">
          <div class="card__body" style="text-align: center;">
            <h4 style="color: var(--color-text-secondary); margin: 0 0 8px 0;">Quitações</h4>
            <p style="font-size: 24px; font-weight: 600; margin: 0;" id="totalQuitacoes">R$ 0,00</p>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card__header">
          <h3>Filtros</h3>
        </div>
        <div class="card__body">
          <div class="form-row">
            <div class="form-group">
              <label for="filtroCliente" class="form-label">Cliente</label>
              <select id="filtroCliente" class="form-control" onchange="HistoricoModule.onFilterChange()">
                <option value="">Todos os clientes</option>
              </select>
            </div>
            <div class="form-group">
              <label for="filtroTipo" class="form-label">Tipo de Pagamento</label>
              <select id="filtroTipo" class="form-control" onchange="HistoricoModule.onFilterChange()">
                <option value="">Todos os tipos</option>
                <option value="juros">Pagamento de Juros</option>
                <option value="quitacao">Quitação Total</option>
              </select>
            </div>
            <div class="form-group">
              <label for="filtroDataInicio" class="form-label">Data Início</label>
              <input type="date" id="filtroDataInicio" class="form-control" onchange="HistoricoModule.onFilterChange()" />
            </div>
            <div class="form-group">
              <label for="filtroDataFim" class="form-label">Data Fim</label>
              <input type="date" id="filtroDataFim" class="form-control" onchange="HistoricoModule.onFilterChange()" />
            </div>
            <div class="form-group" style="align-self: flex-end;">
              <button class="btn btn--secondary" onclick="HistoricoModule.limparFiltros()">Limpar Filtros</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Histórico -->
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

    this.bindEvents();
    this.populateClientesFiltro();
    this.setDefaultDates();
  },

  bindEvents() {
    // Eventos específicos do histórico podem ser adicionados aqui
  },

  setDefaultDates() {
    // Data início padrão como 30 dias atrás e data fim hoje
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    document.getElementById('filtroDataInicio').value = trintaDiasAtras.toISOString().split('T')[0];
    document.getElementById('filtroDataFim').value = hoje.toISOString().split('T');
  },

  populateClientesFiltro() {
    const select = document.getElementById('filtroCliente');
    if (!select) return;

    select.innerHTML = '<option value="">Todos os clientes</option>';
    sistema.clientes.forEach(cliente => {
      select.innerHTML += `<option value="${cliente.id}">${cliente.nome}</option>`;
    });
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

    this.filtros = {
      cliente: '',
      tipo: '',
      dataInicio: '',
      dataFim: ''
    };

    this.loadData();
    this.updateStats();
  },

  loadData() {
    const tbody = document.getElementById('historicoTable').querySelector('tbody');
    let historico = sistema.historicoPagamentos;

    // Filtros por cliente e tipo
    if (this.filtros.cliente) {
      historico = historico.filter(h => h.cliente_id === this.filtros.cliente);
    }
    if (this.filtros.tipo) {
      historico = historico.filter(h => h.tipo === this.filtros.tipo);
    }

    // Filtros por data
    if (this.filtros.dataInicio) {
      const dataInicio = new Date(this.filtros.dataInicio);
      historico = historico.filter(h => new Date(h.dataPagamento || h.created_at) >= dataInicio);
    }
    if (this.filtros.dataFim) {
      const dataFim = new Date(this.filtros.dataFim);
      dataFim.setHours(23, 59, 59, 999);
      historico = historico.filter(h => new Date(h.dataPagamento || h.created_at) <= dataFim);
    }

    // Permissões: filtra registros conforme papel do usuário
    if (sistema.currentUser.role !== 'admin') {
      const clientesPermitidos = sistema.clientes.filter(c => {
        if (sistema.currentUser.role === 'manager') {
          return sistema.users.some(u => u.role === 'operator' && u.gerente_id === sistema.currentUser.id && c.responsavel_id === u.id);
        }
        if (sistema.currentUser.role === 'operator') {
          return c.responsavel_id === sistema.currentUser.id;
        }
        return false;
      }).map(c => c.id);
      historico = historico.filter(h => clientesPermitidos.includes(h.cliente_id));
    }

    if (!historico.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--color-text-secondary);">Nenhum registro encontrado.</td></tr>';
      return;
    }

    // Ordenar por data (mais recente primeiro)
    historico.sort((a, b) => new Date(b.dataPagamento || b.created_at) - new Date(a.dataPagamento || a.created_at));

    tbody.innerHTML = historico.map(registro => {
      const cliente = sistema.clientes.find(c => c.id === registro.cliente_id) || {};
      const emprestimo = sistema.emprestimos.find(e => e.id === registro.emprestimo_id) || {};
      const responsavel = sistema.users.find(u => u.id === registro.responsavel_id) || {};

      const dataFormatada = new Date(registro.dataPagamento || registro.created_at).toLocaleDateString('pt-BR');
      const tipoLabels = {
        'juros': 'Pagamento de Juros',
        'quitacao': 'Quitação Total',
        'parcial': 'Pagamento Parcial'
      };

      return `
        <tr>
          <td><strong>${dataFormatada}</strong></td>
          <td>${cliente.nome || 'N/A'}</td>
          <td>
            ${emprestimo.valorPrincipal ? Utils.formatCurrency(emprestimo.valorPrincipal) : '-'}
            ${emprestimo.jurosPerc ? `<br><small>(${emprestimo.jurosPerc}% juros)</small>` : ''}
          </td>
          <td><span class="status-badge status-${registro.tipo === 'quitacao' ? 'success' : 'info'}">${tipoLabels[registro.tipo] || registro.tipo}</span></td>
          <td><strong>${Utils.formatCurrency(registro.valor)}</strong></td>
          <td>${responsavel.name || 'Sistema'}</td>
          <td><button class="btn btn--sm btn--secondary" onclick="HistoricoModule.showDetalhes('${registro.id}')">Detalhes</button></td>
        </tr>
      `;
    }).join('');
  },

  updateStats() {
    const historico = sistema.historicoPagamentos;

    const totalPagamentos = historico.length;
    const valorTotal = historico.reduce((acc, h) => acc + (parseFloat(h.valor) || 0), 0);
    const pagamentosJuros = historico.filter(h => h.tipo === 'juros');
    const valorJuros = pagamentosJuros.reduce((acc, h) => acc + (parseFloat(h.valor) || 0), 0);
    const quitacoes = historico.filter(h => h.tipo === 'quitacao');
    const valorQuitacoes = quitacoes.reduce((acc, h) => acc + (parseFloat(h.valor) || 0), 0);

    document.getElementById('totalPagamentosCount').textContent = totalPagamentos;
    document.getElementById('valorTotalRecebido').textContent = Utils.formatCurrency(valorTotal);
    document.getElementById('totalJuros').textContent = Utils.formatCurrency(valorJuros);
    document.getElementById('totalQuitacoes').textContent = Utils.formatCurrency(valorQuitacoes);
  },

  showDetalhes(id) {
    const registro = sistema.historicoPagamentos.find(h => h.id === id);
    if (!registro) {
      Utils.alert('Registro não encontrado.', 'error');
      return;
    }

    const cliente = sistema.clientes.find(c => c.id === registro.cliente_id) || {};
    const emprestimo = sistema.emprestimos.find(e => e.id === registro.emprestimo_id) || {};
    const responsavel = sistema.users.find(u => u.id === registro.responsavel_id) || {};

    const dataFormatada = new Date(registro.dataPagamento || registro.created_at).toLocaleDateString('pt-BR');
    const horaFormatada = new Date(registro.dataPagamento || registro.created_at).toLocaleTimeString('pt-BR');

    const tipoLabels = {
      'juros': 'Pagamento de Juros',
      'quitacao': 'Quitação Total',
      'parcial': 'Pagamento Parcial'
    };

    const html = `
      <div style="display:grid; gap: 1rem;">
        <div class="form-group">
          <label>Cliente</label>
          <div class="info-box"><strong>${cliente.nome || 'N/A'}</strong>${cliente.contato ? `<br><small>${cliente.contato}</small>` : ''}</div>
        </div>
        <div class="form-group">
          <label>Empréstimo</label>
          <div class="info-box">
            Principal: <strong>${emprestimo.valorPrincipal ? Utils.formatCurrency(emprestimo.valorPrincipal) : '-'}</strong><br>
            Juros: <strong>${emprestimo.jurosPerc ? emprestimo.jurosPerc + '%' : '-'}</strong><br>
            Início: <strong>${emprestimo.dataInicio ? new Date(emprestimo.dataInicio).toLocaleDateString('pt-BR') : '-'}</strong>
          </div>
        </div>
        <div class="form-group">
          <label>Tipo de Pagamento</label>
          <div class="info-box"><span class="status-badge status-${registro.tipo === 'quitacao' ? 'success' : 'info'}">${tipoLabels[registro.tipo]}</span></div>
        </div>
        <div class="form-group">
          <label>Valor Pago</label>
          <div class="info-box"><strong>${Utils.formatCurrency(registro.valor)}</strong></div>
        </div>
        <div class="form-group">
          <label>Data & Hora</label>
          <div class="info-box">${dataFormatada} às ${horaFormatada}</div>
        </div>
        <div class="form-group">
          <label>Registrado por</label>
          <div class="info-box">${responsavel.name || 'Sistema'}</div>
        </div>
        ${registro.observacoes ? `<div class="form-group"><label>Observações</label><div class="info-box">${registro.observacoes}</div></div>` : ''}
      </div>
    `;

    const modalBody = document.getElementById('detalhesModalBody');
    modalBody.innerHTML = html;
    Utils.toggleModal('detalhesModal', true);
  }
};
