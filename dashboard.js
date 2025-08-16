<<<<<<< HEAD
// Dashboard Profissional (dashboard.js)
// ======================================
=======
// dashboard.js
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20

const DashboardModule = {
  timelineChartCreated: false,
  statusChartCreated: false,

  render(container) {
    container.innerHTML = `
<<<<<<< HEAD
      <div class="dashboard-header">
        <div>
          <h2>Dashboard Financeiro</h2>
          <p style="color: var(--color-text-secondary);">Visão geral do seu negócio em tempo real</p>
        </div>
        <div class="dashboard-controls">
          <button class="btn btn--sm btn--secondary" onclick="sistema.zoomOut()" title="Diminuir Zoom">🔍-</button>
          <button class="btn btn--sm btn--secondary" onclick="sistema.resetZoom()" title="Resetar Zoom">↻</button>
          <button class="btn btn--sm btn--secondary" onclick="sistema.zoomIn()" title="Aumentar Zoom">🔍+</button>
        </div>
      </div>

      <!-- Cards de Métricas -->
      <div class="metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="card">
          <div class="card__body" style="text-align: center;">
            <h4 style="color: var(--color-text-secondary); margin: 0 0 8px 0;">Juros Pendentes</h4>
            <p style="font-size: 24px; font-weight: 600; margin: 0;" id="totalJurosPendentes">R$ 0,00</p>
            <small style="color: var(--color-text-secondary);">Juros pendentes de cobrança</small>
          </div>
        </div>
        <div class="card">
          <div class="card__body" style="text-align: center;">
            <h4 style="color: var(--color-text-secondary); margin: 0 0 8px 0;">Pagamentos Recebidos</h4>
            <p style="font-size: 24px; font-weight: 600; margin: 0;" id="totalPagamentos">R$ 0,00</p>
            <small style="color: var(--color-text-secondary);">Pagamentos confirmados</small>
          </div>
        </div>
        <div class="card">
          <div class="card__body" style="text-align: center;">
            <h4 style="color: var(--color-text-secondary); margin: 0 0 8px 0;">Receita Total</h4>
            <p style="font-size: 24px; font-weight: 600; margin: 0;" id="receitaTotal">R$ 0,00</p>
            <small style="color: var(--color-text-secondary);">Acumulado 2025</small>
          </div>
        </div>
        <div class="card">
          <div class="card__body" style="text-align: center;">
            <h4 style="color: var(--color-text-secondary); margin: 0 0 8px 0;">Empréstimos Ativos</h4>
            <p style="font-size: 24px; font-weight: 600; margin: 0;" id="emprestimosAtivos">0</p>
            <small style="color: var(--color-text-secondary);">Com empréstimos vigentes</small>
          </div>
        </div>
        <div class="card">
          <div class="card__body" style="text-align: center;">
            <h4 style="color: var(--color-text-secondary); margin: 0 0 8px 0;">Clientes em Atraso</h4>
            <p style="font-size: 24px; font-weight: 600; margin: 0;" id="clientesAtraso">R$ 0,00</p>
            <small style="color: var(--color-text-secondary);">+30 dias sem pagamento</small>
          </div>
        </div>
      </div>

      <!-- Cards de Informações -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 20px;">
        
        <!-- Top 5 Clientes -->
        <div class="card">
          <div class="card__header">
            <h3 style="margin: 0;">Top 5 Clientes por Juros</h3>
          </div>
          <div class="card__body">
            <div class="table-container" style="border: none; margin: 0;">
              <table class="table" style="font-size: 14px;">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody id="topClientesTable">
                  <tr><td colspan="3">Carregando...</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Próximos Vencimentos -->
        <div class="card">
          <div class="card__header">
            <h3 style="margin: 0;">Próximos Vencimentos (7 dias)</h3>
          </div>
          <div class="card__body">
            <div class="table-container" style="border: none; margin: 0;">
              <table class="table" style="font-size: 14px;">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Valor</th>
                    <th>Vence em</th>
                  </tr>
                </thead>
                <tbody id="vencimentosTable">
                  <tr><td colspan="3">Nenhum vencimento próximo</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 20px;">
        
        <!-- Gráfico de Evolução -->
        <div class="card">
          <div class="card__header">
            <h3 style="margin: 0;">Evolução dos Últimos 6 Meses</h3>
          </div>
          <div class="card__body">
            <div class="chart-container" style="position: relative; height: 300px;">
              <canvas id="evolutionChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Gráfico de Status dos Empréstimos -->
        <div class="card">
          <div class="card__header">
            <h3 style="margin: 0;">Status dos Empréstimos</h3>
          </div>
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
    const emprestimosAtivos = this.getFilteredEmprestimos().filter(e => e.status === 'ativo');
    const historicoPagamentos = this.getFilteredHistoricoPagamentos();
    
    // Juros pendentes (empréstimos ativos)
    const jurosPendentes = emprestimosAtivos.reduce((total, emp) => {
      return total + Utils.calcularJuros(emp.valorPrincipal, emp.jurosPerc);
    }, 0);

    // Pagamentos recebidos (histórico)
    const totalPagamentos = historicoPagamentos.reduce((total, pag) => {
      return total + (parseFloat(pag.valor) || 0);
    }, 0);

    // Receita total (pagamentos + principal quitado)
    const principalQuitado = historicoPagamentos
      .filter(p => p.tipo === 'quitacao')
      .reduce((total, pag) => {
        const emprestimo = sistema.emprestimos.find(e => e.id === pag.emprestimo_id);
        return total + (emprestimo ? emprestimo.valorPrincipal : 0);
      }, 0);

    const receitaTotal = totalPagamentos + principalQuitado;

    // Clientes em atraso (mais de 30 dias)
    const clientesAtraso = emprestimosAtivos.filter(emp => {
      const diasAtraso = Utils.calcularAtraso(emp);
      return diasAtraso > 30;
    });

    const valorClientesAtraso = clientesAtraso.reduce((total, emp) => {
      return total + Utils.calcularJuros(emp.valorPrincipal, emp.jurosPerc);
    }, 0);

    // Atualizar elementos
    document.getElementById('totalJurosPendentes').textContent = Utils.formatCurrency(jurosPendentes);
    document.getElementById('totalPagamentos').textContent = Utils.formatCurrency(totalPagamentos);
    document.getElementById('receitaTotal').textContent = Utils.formatCurrency(receitaTotal);
    document.getElementById('emprestimosAtivos').textContent = emprestimosAtivos.length;
    document.getElementById('clientesAtraso').textContent = Utils.formatCurrency(valorClientesAtraso);
  },

  async loadTopClientes() {
    const tbody = document.getElementById('topClientesTable');
    const historicoPagamentos = this.getFilteredHistoricoPagamentos();
    
    // Agrupar pagamentos por cliente
    const clientesPagamentos = {};
    historicoPagamentos.forEach(pag => {
      if (!clientesPagamentos[pag.cliente_id]) {
        clientesPagamentos[pag.cliente_id] = 0;
      }
      clientesPagamentos[pag.cliente_id] += parseFloat(pag.valor) || 0;
    });

    // Converter para array e ordenar
    const topClientes = Object.entries(clientesPagamentos)
      .map(([clienteId, total]) => ({
        cliente: sistema.clientes.find(c => c.id === clienteId),
        total
      }))
      .filter(item => item.cliente)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    if (topClientes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--color-text-secondary);">Nenhum dado disponível</td></tr>';
      return;
    }

    tbody.innerHTML = topClientes.map((item, index) => `
      <tr>
        <td><strong>${index + 1}º</strong></td>
        <td>${item.cliente.nome}</td>
        <td><strong>${Utils.formatCurrency(item.total)}</strong></td>
      </tr>
    `).join('');
  },

  async loadProximosVencimentos() {
    const tbody = document.getElementById('vencimentosTable');
    const emprestimosAtivos = this.getFilteredEmprestimos().filter(e => e.status === 'ativo');
    
    const hoje = new Date();
    const proximosDias = new Date();
    proximosDias.setDate(hoje.getDate() + 7);

    const vencimentosProximos = emprestimosAtivos
      .map(emp => {
        const vencimento = new Date(emp.dataInicio);
        vencimento.setMonth(vencimento.getMonth() + 1);
        
        const cliente = sistema.clientes.find(c => c.id === emp.clienteId);
        const valorJuros = Utils.calcularJuros(emp.valorPrincipal, emp.jurosPerc);
        const diasParaVencimento = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
        
        return {
          cliente,
          valorJuros,
          vencimento,
          diasParaVencimento
        };
      })
      .filter(item => item.cliente && item.diasParaVencimento >= -3 && item.diasParaVencimento <= 7)
      .sort((a, b) => a.diasParaVencimento - b.diasParaVencimento);

    if (vencimentosProximos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--color-text-secondary);">Nenhum vencimento nos próximos 7 dias</td></tr>';
      return;
    }

    tbody.innerHTML = vencimentosProximos.map(item => {
      let statusVencimento = '';
      let corTexto = '';
      
      if (item.diasParaVencimento < 0) {
        statusVencimento = `${Math.abs(item.diasParaVencimento)} dias atraso`;
        corTexto = 'color: var(--color-error);';
      } else if (item.diasParaVencimento === 0) {
        statusVencimento = 'Vence hoje';
        corTexto = 'color: var(--color-warning);';
      } else {
        statusVencimento = `${item.diasParaVencimento} dias`;
        corTexto = 'color: var(--color-success);';
      }

      return `
        <tr>
          <td>${item.cliente.nome}</td>
          <td><strong>${Utils.formatCurrency(item.valorJuros)}</strong></td>
          <td><span style="${corTexto}">${statusVencimento}</span></td>
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

    // Preparar dados dos últimos 6 meses
    const meses = [];
    const valores = [];
    const hoje = new Date();

    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesString = mes.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      meses.push(mesString);

      // Calcular pagamentos do mês
      const pagamentosMes = this.getFilteredHistoricoPagamentos().filter(pag => {
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
          plugins: {
            legend: {
              display: false
            }
          },
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

    const emprestimos = this.getFilteredEmprestimos();
    const ativos = emprestimos.filter(e => e.status === 'ativo').length;
    const quitados = emprestimos.filter(e => e.status === 'quitado').length;

    try {
      window.statusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Ativos', 'Quitados'],
          datasets: [{
            data: [ativos, quitados],
            backgroundColor: [
              'var(--color-primary)',
              'var(--color-success)'
            ],
            borderWidth: 2,
            borderColor: 'var(--color-surface)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
      
      this.statusChartCreated = true;
    } catch (error) {
      console.error('Erro ao criar gráfico de status:', error);
    }
  },

  // Métodos auxiliares para filtrar dados baseado nas permissões
  getFilteredEmprestimos() {
    if (sistema.currentUser.role === 'admin') {
      return sistema.emprestimos;
    }
    
    const clientesPermitidos = sistema.getFilteredClientes().map(c => c.id);
    return sistema.emprestimos.filter(e => clientesPermitidos.includes(e.clienteId));
  },

  getFilteredHistoricoPagamentos() {
    if (sistema.currentUser.role === 'admin') {
      return sistema.historicoPagamentos;
    }
    
    const clientesPermitidos = sistema.getFilteredClientes().map(c => c.id);
    return sistema.historicoPagamentos.filter(h => clientesPermitidos.includes(h.cliente_id));
  }
};
=======
      <section class="dashboard-header">
        <div>
          <h3>Visão geral do seu negócio em tempo real</h3>
        </div>
        <div class="metrics-grid">
          <div class="metric-card">
            <h4>Juros pendentes de cobrança</h4>
            <p id="pendingInterest">R$ 0,00</p>
          </div>
          <div class="metric-card">
            <h4>Pagamentos confirmados</h4>
            <p id="confirmedPayments">R$ 0,00</p>
          </div>
          <div class="metric-card">
            <h4>Acumulado 2025</h4>
            <p id="total2025">R$ 0,00</p>
          </div>
          <div class="metric-card">
            <h4>Empréstimos vigentes</h4>
            <p id="activeLoans">0</p>
          </div>
          <div class="metric-card">
            <h4>+90 dias sem pagamento</h4>
            <p id="overdue90">R$ 0,00</p>
          </div>
        </div>
      </section>

      <section class="dashboard-tables">

        <div class="table-container">
          <h3>Top 5 clientes por juros pagos</h3>
          <table class="table" id="topClients">
            <thead>
              <tr><th>#</th><th>Cliente</th><th>Juros Pagos</th></tr>
            </thead>
            <tbody><tr><td colspan="3">Carregando...</td></tr></tbody>
          </table>
        </div>

        <div class="table-container">
          <h3>Próximos vencimentos (7 dias)</h3>
          <table class="table" id="nextDue">
            <thead>
              <tr><th>Cliente</th><th>Valor</th><th>Vence em</th></tr>
            </thead>
            <tbody><tr><td colspan="3">Nenhum vencimento próximo</td></tr></tbody>
          </table>
        </div>

      </section>
    `;
  },

  loadData() {
    // Aqui você deve carregar e processar dados do sistema, preencher métricas e tabelas
    // Exemplo simplificado (substitua pela lógica real com supabase e cálculo)
    document.getElementById('pendingInterest').textContent = 'R$ 500,00'; // valor dummy
    document.getElementById('confirmedPayments').textContent = 'R$ 1200,00';
    document.getElementById('total2025').textContent = 'R$ 5000,00';
    document.getElementById('activeLoans').textContent = '15';
    document.getElementById('overdue90').textContent = 'R$ 300,00';

    const tbodyTopClients = document.getElementById('topClients').querySelector('tbody');
    tbodyTopClients.innerHTML = `
      <tr><td>1</td><td>João Silva</td><td>R$ 1000,00</td></tr>
      <tr><td>2</td><td>Maria Souza</td><td>R$ 850,00</td></tr>
      <tr><td>3</td><td>Carlos Lima</td><td>R$ 770,00</td></tr>
      <tr><td>4</td><td>Ana Costa</td><td>R$ 650,00</td></tr>
      <tr><td>5</td><td>Paulo Mendes</td><td>R$ 600,00</td></tr>
    `;

    const tbodyNextDue = document.getElementById('nextDue').querySelector('tbody');
    tbodyNextDue.innerHTML = `
      <tr><td>João Silva</td><td>R$ 500,00</td><td>${new Date().toLocaleDateString()}</td></tr>
    `;
  }
};
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
