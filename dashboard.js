// Módulo Dashboard
const DashboardModule = {
  
  // Renderizar dashboard
  render() {
    return `
      <div class="dashboard-container">
        <div class="dashboard-header">
          <h2>Dashboard Financeiro</h2>
          <div class="dashboard-controls">
            <button id="refreshDashboard" class="btn btn--secondary">🔄 Atualizar</button>
          </div>
        </div>
        
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value" id="totalRecebimentos">R$ 0,00</div>
            <div class="metric-label">Total Recebido</div>
          </div>
          <div class="metric-card">
            <div class="metric-value" id="clientesAtivos">0</div>
            <div class="metric-label">Clientes Ativos</div>
          </div>
          <div class="metric-card">
            <div class="metric-value" id="emprestimosAtivos">0</div>
            <div class="metric-label">Empréstimos Ativos</div>
          </div>
          <div class="metric-card">
            <div class="metric-value" id="proxVencimentos">0</div>
            <div class="metric-label">Vencimentos (7 dias)</div>
          </div>
        </div>

        <div class="dashboard-charts">
          <div class="chart-container">
            <h3>Evolução Mensal</h3>
            <canvas id="monthlyChart"></canvas>
          </div>
          <div class="chart-container">
            <h3>Top 5 Clientes</h3>
            <canvas id="topClientsChart"></canvas>
          </div>
        </div>
      </div>
    `;
  },

  // Inicializar dashboard
  init() {
    this.updateMetrics();
    this.renderCharts();
    
    // Event listeners
    document.getElementById('refreshDashboard')?.addEventListener('click', () => {
      this.updateMetrics();
      this.renderCharts();
    });
  },

  // Atualizar métricas
  updateMetrics() {
    const sistema = window.sistema;
    if (!sistema) return;

    // Total recebido
    const totalRecebido = sistema.historicoPagamentos
      .reduce((total, pag) => total + (pag.valor || 0), 0);
    
    document.getElementById('totalRecebimentos').textContent = 
      Utils.formatCurrency(totalRecebido);

    // Clientes ativos
    const clientesAtivos = sistema.clientes.filter(c => c.status === 'ativo').length;
    document.getElementById('clientesAtivos').textContent = clientesAtivos;

    // Empréstimos ativos
    const emprestimosAtivos = sistema.emprestimos.filter(e => e.status === 'ativo').length;
    document.getElementById('emprestimosAtivos').textContent = emprestimosAtivos;

    // Próximos vencimentos
    const hoje = new Date();
    const em7dias = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const proxVencimentos = sistema.emprestimos.filter(e => {
      if (e.status !== 'ativo') return false;
      const vencimento = new Date(e.proximoVencimento);
      return vencimento >= hoje && vencimento <= em7dias;
    }).length;
    
    document.getElementById('proxVencimentos').textContent = proxVencimentos;
  },

  // Renderizar gráficos
  renderCharts() {
    this.renderMonthlyChart();
    this.renderTopClientsChart();
  },

  // Gráfico mensal
  renderMonthlyChart() {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;

    const sistema = window.sistema;
    if (!sistema) return;

    // Dados dos últimos 6 meses
    const meses = [];
    const valores = [];
    
    for (let i = 5; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                         'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      meses.push(nomesMeses[data.getMonth()]);
      
      const valorMes = sistema.historicoPagamentos
        .filter(p => p.data.startsWith(mesAno))
        .reduce((total, p) => total + (p.valor || 0), 0);
      
      valores.push(valorMes);
    }

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: meses,
        datasets: [{
          label: 'Recebimentos',
          data: valores,
          borderColor: '#33bca7',
          backgroundColor: 'rgba(51, 188, 167, 0.1)',
          borderWidth: 2,
          fill: true
        }]
      },
      options: {
        responsive: true,
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
                return 'R$ ' + value.toLocaleString('pt-BR');
              }
            }
          }
        }
      }
    });
  },

  // Gráfico top clientes
  renderTopClientsChart() {
    const ctx = document.getElementById('topClientsChart');
    if (!ctx) return;

    const sistema = window.sistema;
    if (!sistema) return;

    // Calcular total pago por cliente
    const clientePagamentos = {};
    
    sistema.historicoPagamentos.forEach(pag => {
      if (pag.clienteId) {
        clientePagamentos[pag.clienteId] = 
          (clientePagamentos[pag.clienteId] || 0) + (pag.valor || 0);
      }
    });

    // Top 5 clientes
    const topClientes = Object.entries(clientePagamentos)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    const nomes = topClientes.map(([id]) => {
      const cliente = sistema.clientes.find(c => c.id === id);
      return cliente ? cliente.nome.split(' ')[0] : 'Cliente';
    });

    const valores = topClientes.map(([, valor]) => valor);

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: nomes,
        datasets: [{
          data: valores,
          backgroundColor: [
            '#33bca7',
            '#45a29e',
            '#5f939a',
            '#78839d',
            '#8e73a0'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
};

// Tornar disponível globalmente
window.DashboardModule = DashboardModule;

console.log('✅ DashboardModule carregado com sucesso!');