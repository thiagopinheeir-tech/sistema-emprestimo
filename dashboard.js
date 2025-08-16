const DashboardModule = {
  render(container) {
    container.innerHTML = `
      <div class="page-header">
        <h2>Dashboard Financeiro</h2>
        <p>Visão geral do seu negócio em tempo real</p>
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <h4>Juros Pendentes</h4>
          <p id="jurosPendentes">R$ 0,00</p>
          <small>Juros pendentes de cobrança</small>
        </div>
        <div class="metric-card">
          <h4>Pagamentos Recebidos</h4>
          <p id="pagamentosRecebidos">R$ 0,00</p>
          <small>Pagamentos confirmados</small>
        </div>
        <div class="metric-card">
          <h4>Receita Total</h4>
          <p id="receitaTotal">R$ 0,00</p>
          <small>Acumulado 2025</small>
        </div>
        <div class="metric-card">
          <h4>Empréstimos Ativos</h4>
          <p id="emprestimosAtivos">0</p>
          <small>Com empréstimos vigentes</small>
        </div>
        <div class="metric-card">
          <h4>Clientes em Atraso</h4>
          <p id="clientesAtraso">R$ 0,00</p>
          <small>+30 dias sem pagamento</small>
        </div>
      </div>

      <div class="table-container">
        <h4>Próximos Vencimentos (7 dias)</h4>
        <table class="table" id="vencimentosTable">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Vence em</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="3">Nenhum vencimento nos próximos 7 dias</td></tr>
          </tbody>
        </table>
      </div>

      <div class="table-container">
        <h4>Status dos Empréstimos</h4>
        <canvas id="chartStatus" height="150"></canvas>
      </div>
    `;

    this.loadData();
  },

  loadData() {
    if (!sistema.currentUser) return;

    // Calcular juros pendentes
    const jurosPendentes = sistema.emprestimos.reduce((acc, emp) => {
      if (emp.status === 'ativo') {
        return acc + (emp.valorPrincipal * emp.jurosPerc) / 100;
      }
      return acc;
    }, 0);

    let pagamentosRecebidos = 0;
    let receitaTotal = 0;
    let emprestimosAtivos = 0;
    let clientesAtraso = 0;

    sistema.historicoPagamentos.forEach(h => {
      receitaTotal += parseFloat(h.valor) || 0;
      if(h.tipo === 'juros') pagamentosRecebidos += parseFloat(h.valor) || 0;
    });

    sistema.emprestimos.forEach(emp => {
      if(emp.status === 'ativo') emprestimosAtivos += 1;
    });

    // Clientes atrasados (supondo atraso > 30 dias)
    sistema.clientes.forEach(cliente => {
      const atraso = sistema.emprestimos.some(emp => {
        if(emp.clienteId === cliente.id) {
          const venc = new Date(emp.dataInicio);
          venc.setMonth(venc.getMonth() + 1);
          const hoje = new Date();
          const diasAtraso = Math.floor((hoje - venc) / (1000 * 3600 * 24));
          return diasAtraso > 30 && emp.status === 'ativo';
        }
        return false;
      });
      if(atraso) clientesAtraso += 1;
    });

    document.getElementById('jurosPendentes').textContent = Utils.formatCurrency(jurosPendentes);
    document.getElementById('pagamentosRecebidos').textContent = Utils.formatCurrency(pagamentosRecebidos);
    document.getElementById('receitaTotal').textContent = Utils.formatCurrency(receitaTotal);
    document.getElementById('emprestimosAtivos').textContent = emprestimosAtivos;
    document.getElementById('clientesAtraso').textContent = clientesAtraso;

    // Preencher tabela de próximos vencimentos - próximos 7 dias
    const vencimentosTable = document.querySelector('#vencimentosTable tbody');
    const hoje = new Date();
    const seteDiasDepois = new Date();
    seteDiasDepois.setDate(hoje.getDate() + 7);

    const proximosVencimentos = sistema.emprestimos.filter(emp => {
      if(emp.status !== 'ativo') return false;
      const venc = new Date(emp.dataInicio);
      venc.setMonth(venc.getMonth() + 1);
      return venc >= hoje && venc <= seteDiasDepois;
    });

    if(proximosVencimentos.length === 0) {
      vencimentosTable.innerHTML = '<tr><td colspan="3">Nenhum vencimento nos próximos 7 dias</td></tr>';
    } else {
      vencimentosTable.innerHTML = proximosVencimentos.map(emp => {
        const cliente = sistema.clientes.find(c => c.id === emp.clienteId) || {};
        const venc = new Date(emp.dataInicio);
        venc.setMonth(venc.getMonth() + 1);
        return `
          <tr>
            <td>${cliente.nome || '-'}</td>
            <td>${Utils.formatCurrency(emp.valorPrincipal)}</td>
            <td>${venc.toLocaleDateString()}</td>
          </tr>`;
      }).join('');
    }

    // Desenhar gráfico status empréstimos
    const ctx = document.getElementById('chartStatus').getContext('2d');
    const statusCounts = sistema.emprestimos.reduce((acc, emp) => {
      acc[emp.status] = (acc[emp.status] || 0) + 1;
      return acc;
    }, {});
    const labels = Object.keys(statusCounts);
    const data = {
      labels,
      datasets: [{
        label: 'Status dos Empréstimos',
        backgroundColor: ['#2196F3', '#4CAF50', '#F44336'],
        data: labels.map(label => statusCounts[label]),
      }],
    };
    if(window.__chart) window.__chart.destroy();
    window.__chart = new Chart(ctx, {
      type: 'pie',
      data,
      options: {
        responsive: true,
      }
    });
  }
};
