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
  },

  loadData() {
    const tbody = document.getElementById('historicoTable').querySelector('tbody');

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
