// Dashboard Profissional (dashboard.js)
// ======================================

const DashboardModule = {
  timelineChartCreated: false,
  statusChartCreated: false,

  render(container) {
    container.innerHTML = `
      <div class="dashboard-header">
        <h2>Dashboard Financeiro</h2>
        <p style="color: var(--color-text-secondary);">Visão geral do seu negócio em tempo real</p>
      </div>

      <div class="metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="card"><div class="card__body">
          <h4 style="color: var(--color-text-secondary); margin: 0 0 8px 0;">Juros Pendentes</h4>
          <p style="font-size: 24px; font-weight: 600; margin: 0;" id="totalJurosPendentes">R$ 0,00</p>
          <small style="color: var(--color-text-secondary);">Juros pendentes de cobrança</small>
        </div></div>
        <div class="card"><div class="card__body">
          <h4 style="color: var(--color-text-secondary); margin: 0 0 8px 0;">Pagamentos Recebidos</h4>
          <p style="font-size: 24px; font-weight: 600; margin: 0;" id="totalPagamentos">R$ 0,00</p>
          <small style="color: var(--color-text-secondary);">Pagamentos confirmados</small>
        </div></div>
        <div class="card"><div class="card__body">
          <h4 style="color: var(--color-text-secondary); margin: 0 0 8px 0;">Receita Total</h4>
          <p style="font-size: 24px; font-weight: 600; margin: 0;" id="receitaTotal">R$ 0,00</p>
          <small style="color: var(--color-text-secondary);">Acumulado 2025</small>
        </div></div>
        <div class="card"><div class="card__body">
          <h4 style="color: var(--color-text-secondary); margin: 0 0 8px 0;">Empréstimos Ativos</h4>
          <p style="font-size: 24px; font-weight: 600; margin: 0;" id="emprestimosAtivos">0</p>
          <small style="color: var(--color-text-secondary);">Com empréstimos vigentes</small>
        </div></div>
        <div class="card"><div class="card__body">
          <h4 style="color: var(--color-text-secondary); margin: 0 0 8px 0;">Clientes em Atraso</h4>
          <p style="font-size: 24px; font-weight: 600; margin: 0;" id="clientesAtraso">R$ 0,00</p>
          <small style="color: var(--color-text-secondary);">+30 dias sem pagamento</small>
        </div></div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 20px;">
        <!-- Top 5 Clientes -->
        <div class="card">
          <div class="card__header"><h3>Top 5 Clientes por Juros</h3></div>
          <div class="card__body">
            <div class="table-container" style="border: none; margin: 0;">
              <table class="table" style="font-size: 14px;">
                <thead><tr><th>#</th><th>Cliente</th><th>Valor</th></tr></thead>
                <tbody id="topClientesTable"><tr><td colspan="3">Carregando...</td></tr></tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- Próximos Vencimentos -->
        <div class="card">
          <div class="card__header"><h3>Próximos Vencimentos (7 dias)</h3></div>
          <div class="card__body">
            <div class="table-container" style="border: none; margin: 0;">
              <table class="table" style="font-size: 14px;">
                <thead><tr><th>Cliente</th><th>Valor</th><th>Vence em</th></tr></thead>
                <tbody id="vencimentosTable"><tr><td colspan="3">Nenhum vencimento próximo</td></tr></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <!-- Gráficos -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 20px;">
        <!-- Gráfico de Evolução -->
        <div class="card">
          <div class="card__header"><h3>Evolução dos Últimos 6 Meses</h3></div>
          <div class="card__body">
            <div class="chart-container" style="position: relative; height: 300px;">
              <canvas id="evolutionChart"></canvas>
            </div>
          </div>
        </div>
        <!-- Gráfico de Status dos Empréstimos -->
        <div class="card">
          <div class="card__header"><h3>Status dos Empréstimos</h3></div>
          <div class="card__body">
            <div class="chart-container" style="position: relative; height: 300px;">
              <canvas id="statusChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  },

  bindEvents() {
    // Eventos específicos do dashboard podem ser adicionados aqui
  },

  async loadData() {
    try {
      await this.updateMetrics();
      await this.loadTopClientes();
      await this.loadProximosVencimentos();
      await this.createCharts();
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  },

  async updateMetrics() {
    const emprestimosAtivos = sistema.emprestimos.filter(e => e.status === 'ativo');
    const historicoPagamentos = sistema.historicoPagamentos;

    // Juros pendentes
    const jurosPendentes = emprestimosAtivos.reduce((total, emp) => total + Utils.calcularJuros(emp.valorPrincipal, emp.jurosPerc), 0);

    // Pagamentos recebidos
    const totalPagamentos = historicoPagamentos.reduce((total, pag) => total + (parseFloat(pag.valor) || 0), 0);

    // Receita total
    const principalQuitado = historicoPagamentos.filter(p => p.tipo === 'quitacao')
      .reduce((total, pag) => {
        const emprestimo = sistema.emprestimos.find(e => e.id === pag.emprestimo_id);
        return total + (emprestimo ? emprestimo.valorPrincipal : 0);
      }, 0);

    const receitaTotal = totalPagamentos + principalQuitado;

    // Clientes em atraso (+30 dias)
    const clientesAtraso = emprestimosAtivos.filter(emp => Utils.calcularAtraso(emp) > 30);
    const valorClientesAtraso = clientesAtraso.reduce((total, emp) => total + Utils.calcularJuros(emp.valorPrincipal, emp.jurosPerc), 0);

    // Atualizar HTML
    document.getElementById('totalJurosPendentes').textContent = Utils.formatCurrency(jurosPendentes);
    document.getElementById('totalPagamentos').textContent = Utils.formatCurrency(totalPagamentos);
    document.getElementById('receitaTotal').textContent = Utils.formatCurrency(receitaTotal);
    document.getElementById('emprestimosAtivos').textContent = emprestimosAtivos.length;
    document.getElementById('clientesAtraso').textContent = Utils.formatCurrency(valorClientesAtraso);
  },

  async loadTopClientes() {
    const tbody = document.getElementById('topClientesTable');
    const historicoPagamentos = sistema.historicoPagamentos;
    const clientesPagamentos = {};

    historicoPagamentos.forEach(pag => {
      if (!clientesPagamentos[pag.cliente_id]) clientesPagamentos[pag.cliente_id] = 0;
      clientesPagamentos[pag.cliente_id] += parseFloat(pag.valor) || 0;
    });

    const topClientes = Object.entries(clientesPagamentos)
      .map(([cid, total]) => ({
        cliente: sistema.clientes.find(c => c.id === cid),
        total
      }))
      .filter(item => item.cliente)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    if (topClientes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--color-text-secondary);">Nenhum dado disponível</td></tr>';
      return;
    }

    tbody.innerHTML = topClientes.map((item, idx) => `
      <tr>
        <td><strong>${idx + 1}º</strong></td>
        <td>${item.cliente.nome}</td>
        <td><strong>${Utils.formatCurrency(item.total)}</strong></td>
      </tr>
    `).join('');
  },

  async loadProximosVencimentos() {
    const tbody = document.getElementById('vencimentosTable');
    const emprestimosAtivos = sistema.emprestimos.filter(e => e.status === 'ativo');
    const hoje = new Date();

    const vencimentos = emprestimosAtivos
      .map(emp => {
        const vencimento = new Date(emp.dataInicio);
        vencimento.setMonth(vencimento.getMonth() + 1);
        const cliente = sistema.clientes.find(c => c.id === emp.clienteId);
        const valorJuros = Utils.calcularJuros(emp.valorPrincipal, emp.jurosPerc);
        const diasParaVencimento = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
        return { cliente, valorJuros, vencimento, diasParaVencimento };
      })
      .filter(item => item.cliente && item.diasParaVencimento >= -3 && item.diasParaVencimento <= 7)
      .sort((a, b) => a.diasParaVencimento - b.diasParaVencimento);

    if (vencimentos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--color-text-secondary);">Nenhum vencimento nos próximos 7 dias</td></tr>';
      return;
    }

    tbody.innerHTML = vencimentos.map(item => {
      let statusVenc = '';
      let corTexto = '';
      if (item.diasParaVencimento < 0) {
        statusVenc = `${Math.abs(item.diasParaVencimento)} dia(s) atraso`;
        corTexto = 'color: var(--color-error);';
      } else if (item.diasParaVencimento === 0) {
        statusVenc = 'Vence hoje';
        corTexto = 'color: var(--color-warning);';
      } else {
        statusVenc = `${item.diasParaVencimento} dia(s)`;
        corTexto = 'color: var(--color-success);';
      }
      return `
        <tr>
          <td>${item.cliente.nome}</td>
          <td><strong>${Utils.formatCurrency(item.valorJuros)}</strong></td>
          <td><span style="${corTexto}">${statusVenc}</span></td>
        </tr>
      `;
    }).join('');
  },

  async createCharts() {
    this.createEvolutionChart();
    this.createStatusChart();
  },

  createEvolutionChart() {
    const ctx = document.getElementById('evolutionChart');
    if (!ctx || this.timelineChartCreated) return;

    const meses = [];
    const valores = [];
    const hoje = new Date();

    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesString = mes.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      meses.push(mesString);

      const pagamentosMes = sistema.historicoPagamentos.filter(pag => {
        const dataPag = new Date(pag.dataPagamento || pag.created_at);
        return dataPag.getMonth() === mes.getMonth() && dataPag.getFullYear() === mes.getFullYear();
      });
      const valorMes = pagamentosMes.reduce((total, pag) => total + (parseFloat(pag.valor) || 0), 0);
      valores.push(valorMes);
    }

    try {
      window.timelineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: meses,
          datasets: [{
            label: 'Pagamentos Recebidos',
            data: valores,
            borderColor: 'var(--color-primary)',
            backgroundColor: 'rgba(51, 188, 167, 0.1)',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0
                  }).format(value);
                }
              }
            }
          }
        }
      });
      this.timelineChartCreated = true;
    } catch (error) {
      console.error('Erro ao criar gráfico de evolução:', error);
    }
  },

  createStatusChart() {
    const ctx = document.getElementById('statusChart');
    if (!ctx || this.statusChartCreated) return;

    const emprestimos = sistema.emprestimos;
    const ativos = emprestimos.filter(e => e.status === 'ativo').length;
    const quitados = emprestimos.filter(e => e.status === 'quitado').length;

    try {
      window.statusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Ativos', 'Quitados'],
          datasets: [{
            data: [ativos, quitados],
            backgroundColor: ['var(--color-primary)', 'var(--color-success)'],
            borderWidth: 2,
            borderColor: 'var(--color-surface)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
      this.statusChartCreated = true;
    } catch (error) {
      console.error('Erro ao criar gráfico de status:', error);
    }
  }
};
