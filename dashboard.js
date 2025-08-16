// dashboard.js

const DashboardModule = {
  timelineChartCreated: false,
  statusChartCreated: false,

  render(container) {
    container.innerHTML = `
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
