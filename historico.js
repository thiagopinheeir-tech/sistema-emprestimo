<<<<<<< HEAD
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
          <h3 style="margin: 0;">Filtros</h3>
        </div>
        <div class="card__body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="filtroCliente">Cliente</label>
              <select id="filtroCliente" class="form-control" onchange="HistoricoModule.onFilterChange()">
                <option value="">Todos os clientes</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="filtroTipo">Tipo de Pagamento</label>
              <select id="filtroTipo" class="form-control" onchange="HistoricoModule.onFilterChange()">
                <option value="">Todos os tipos</option>
                <option value="juros">Pagamento de Juros</option>
                <option value="quitacao">Quitação Total</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="filtroDataInicio">Data Início</label>
              <input type="date" id="filtroDataInicio" class="form-control" onchange="HistoricoModule.onFilterChange()" />
            </div>
            <div class="form-group">
              <label class="form-label" for="filtroDataFim">Data Fim</label>
              <input type="date" id="filtroDataFim" class="form-control" onchange="HistoricoModule.onFilterChange()" />
            </div>
            <div class="form-group" style="display: flex; align-items: flex-end;">
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

      <!-- Modal de Detalhes -->
      <div id="detalhesModal" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Detalhes do Pagamento</h3>
            <button class="btn-close" onclick="HistoricoModule.closeDetalhesModal()">&times;</button>
          </div>
          <div class="modal-body" id="detalhesModalBody">
            <!-- Conteúdo será preenchido dinamicamente -->
          </div>
        </div>
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
    // Definir data de início como 30 dias atrás
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    document.getElementById('filtroDataInicio').value = trintaDiasAtras.toISOString().split('T')[0];
    document.getElementById('filtroDataFim').value = hoje.toISOString().split('T')[0];
  },

  populateClientesFiltro() {
    const select = document.getElementById('filtroCliente');
    if (!select) return;

    select.innerHTML = '<option value="">Todos os clientes</option>';
    
    const clientesDisponiveis = sistema.getFilteredClientes();
    clientesDisponiveis.forEach(cliente => {
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
=======
// historico.js

const HistoricoModule = {
  render(container) {
    container.innerHTML = `
      <section class="page-header">
        <h2>Histórico de Pagamentos</h2>
      </section>

      <section class="table-container">
        <table class="table" id="historicoTable">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Data Pagamento</th>
              <th>Valor</th>
              <th>Tipo</th>
              <th>Responsável</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="5">Carregando histórico...</td></tr>
          </tbody>
        </table>
      </section>
    `;
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
  },

  loadData() {
    const tbody = document.getElementById('historicoTable').querySelector('tbody');
<<<<<<< HEAD
    const historico = this.getFilteredHistorico();

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
          <td>${cliente.nome || 'Cliente não encontrado'}</td>
          <td>
            ${emprestimo.valorPrincipal ? Utils.formatCurrency(emprestimo.valorPrincipal) : '-'}
            ${emprestimo.jurosPerc ? `<br><small>(${emprestimo.jurosPerc}% juros)</small>` : ''}
          </td>
          <td>
            <span class="status-badge status-${registro.tipo === 'quitacao' ? 'success' : 'info'}">
              ${tipoLabels[registro.tipo] || registro.tipo}
            </span>
          </td>
          <td><strong>${Utils.formatCurrency(registro.valor)}</strong></td>
          <td>${responsavel.name || 'Sistema'}</td>
          <td>
            <button class="btn btn--sm btn--secondary" onclick="HistoricoModule.showDetalhes('${registro.id}')">
              Detalhes
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  updateStats() {
    const historico = this.getFilteredHistorico();
    
    const totalPagamentos = historico.length;
    const valorTotal = historico.reduce((sum, h) => sum + (parseFloat(h.valor) || 0), 0);
    
    const pagamentosJuros = historico.filter(h => h.tipo === 'juros');
    const valorJuros = pagamentosJuros.reduce((sum, h) => sum + (parseFloat(h.valor) || 0), 0);
    
    const quitacoes = historico.filter(h => h.tipo === 'quitacao');
    const valorQuitacoes = quitacoes.reduce((sum, h) => sum + (parseFloat(h.valor) || 0), 0);

    document.getElementById('totalPagamentosCount').textContent = totalPagamentos;
    document.getElementById('valorTotalRecebido').textContent = Utils.formatCurrency(valorTotal);
    document.getElementById('totalJuros').textContent = Utils.formatCurrency(valorJuros);
    document.getElementById('totalQuitacoes').textContent = Utils.formatCurrency(valorQuitacoes);
  },

  showDetalhes(registroId) {
    const registro = sistema.historicoPagamentos.find(h => h.id === registroId);
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

    const detalhesHTML = `
      <div style="display: grid; gap: 16px;">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Cliente</label>
            <div style="padding: 8px 12px; background: var(--color-secondary); border-radius: 6px;">
              <strong>${cliente.nome || 'Cliente não encontrado'}</strong>
              ${cliente.contato ? `<br><small>${cliente.contato}</small>` : ''}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Empréstimo</label>
            <div style="padding: 8px 12px; background: var(--color-secondary); border-radius: 6px;">
              Principal: <strong>${emprestimo.valorPrincipal ? Utils.formatCurrency(emprestimo.valorPrincipal) : '-'}</strong>
              ${emprestimo.jurosPerc ? `<br>Juros: <strong>${emprestimo.jurosPerc}%</strong>` : ''}
              ${emprestimo.dataInicio ? `<br>Início: <strong>${new Date(emprestimo.dataInicio).toLocaleDateString('pt-BR')}</strong>` : ''}
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Tipo de Pagamento</label>
            <div style="padding: 8px 12px; background: var(--color-secondary); border-radius: 6px;">
              <span class="status-badge status-${registro.tipo === 'quitacao' ? 'success' : 'info'}">
                ${tipoLabels[registro.tipo] || registro.tipo}
              </span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Valor Pago</label>
            <div style="padding: 8px 12px; background: var(--color-secondary); border-radius: 6px;">
              <strong style="font-size: 18px;">${Utils.formatCurrency(registro.valor)}</strong>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Data e Hora</label>
            <div style="padding: 8px 12px; background: var(--color-secondary); border-radius: 6px;">
              <strong>${dataFormatada}</strong> às <strong>${horaFormatada}</strong>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Registrado por</label>
            <div style="padding: 8px 12px; background: var(--color-secondary); border-radius: 6px;">
              <strong>${responsavel.name || 'Sistema'}</strong>
              ${responsavel.role ? `<br><small>${responsavel.role}</small>` : ''}
            </div>
          </div>
        </div>

        ${registro.observacoes ? `
          <div class="form-group">
            <label class="form-label">Observações</label>
            <div style="padding: 8px 12px; background: var(--color-secondary); border-radius: 6px;">
              ${registro.observacoes}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    document.getElementById('detalhesModalBody').innerHTML = detalhesHTML;
    Utils.toggleModal('detalhesModal', true);
  },

  closeDetalhesModal() {
    Utils.toggleModal('detalhesModal', false);
  },

  exportarCSV() {
    const historico = this.getFilteredHistorico();
    
    if (!historico.length) {
      Utils.alert('Não há dados para exportar.', 'info');
      return;
    }

    const csvHeader = 'Data,Cliente,Tipo,Valor,Responsável\n';
    const csvData = historico.map(registro => {
      const cliente = sistema.clientes.find(c => c.id === registro.cliente_id) || {};
      const responsavel = sistema.users.find(u => u.id === registro.responsavel_id) || {};
      const dataFormatada = new Date(registro.dataPagamento || registro.created_at).toLocaleDateString('pt-BR');
      
      const tipoLabels = {
        'juros': 'Pagamento de Juros',
        'quitacao': 'Quitação Total',
        'parcial': 'Pagamento Parcial'
      };

      return `"${dataFormatada}","${cliente.nome || 'N/A'}","${tipoLabels[registro.tipo] || registro.tipo}","${registro.valor}","${responsavel.name || 'Sistema'}"`;
    }).join('\n');

    const csv = csvHeader + csvData;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `historico-pagamentos-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  // Obter histórico filtrado por permissão e filtros aplicados
  getFilteredHistorico() {
    let historico;
    
    if (sistema.currentUser.role === 'admin') {
      historico = sistema.historicoPagamentos;
    } else {
      const clientesPermitidos = sistema.getFilteredClientes().map(c => c.id);
      historico = sistema.historicoPagamentos.filter(h => clientesPermitidos.includes(h.cliente_id));
    }

    // Aplicar filtros
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
      dataFim.setHours(23, 59, 59, 999); // Final do dia
      historico = historico.filter(h => new Date(h.dataPagamento || h.created_at) <= dataFim);
    }

    return historico;
  }
};
=======

    if (!sistema.historicoPagamentos.length) {
      tbody.innerHTML = '<tr><td colspan="5">Nenhum pagamento registrado.</td></tr>';
      return;
    }

    tbody.innerHTML = sistema.historicoPagamentos.map(pag => {
      const cliente = sistema.clientes.find(c => c.id === pag.cliente_id) || {};
      const responsavel = sistema.users.find(u => u.id === pag.responsavel_id) || {};
      const dataPagamento = new Date(pag.dataPagamento || pag.created_at || '').toLocaleDateString('pt-BR');
      const valor = Utils.formatCurrency(pag.valor || 0);
      const tipo = pag.tipo ? pag.tipo.charAt(0).toUpperCase() + pag.tipo.slice(1) : '-';

      return `
        <tr>
          <td>${cliente.nome || '-'}</td>
          <td>${dataPagamento}</td>
          <td>${valor}</td>
          <td>${tipo}</td>
          <td>${responsavel.name || '-'}</td>
        </tr>
      `;
    }).join('');
  }
};
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
