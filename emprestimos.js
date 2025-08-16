// emprestimos.js

const EmprestimosModule = {
  render(container) {
    container.innerHTML = `
      <section class="page-header">
        <h2>Empréstimos</h2>
        <button class="btn btn--primary" id="addEmprestimoBtn">Novo Empréstimo</button>
      </section>
      <section class="table-container">
        <table class="table" id="emprestimosTable">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Cliente</th>
              <th>Data Início</th>
              <th>Vencimento</th>
              <th>Valor Principal</th>
              <th>Juros %</th>
              <th>Valor Juros</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="9">Carregando empréstimos...</td></tr>
          </tbody>
        </table>
      </section>

      <div id="emprestimoFormModal" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modalTitleEmprestimo">Novo Empréstimo</h3>
            <button class="btn-close" id="closeEmprestimoModalBtn">&times;</button>
          </div>
          <div class="modal-body">
            <form id="emprestimoForm">
              <div class="form-group">
                <label for="clienteId">Cliente</label>
                <select id="clienteId" name="clienteId" class="form-control" required>
                  <option value="">Selecione...</option>
                </select>
              </div>
              <div class="form-group">
                <label for="valorPrincipal">Valor Principal</label>
                <input type="number" id="valorPrincipal" name="valorPrincipal" class="form-control" min="1" required />
              </div>
              <div class="form-group">
                <label for="jurosPerc">Juros (%)</label>
                <input type="number" id="jurosPerc" name="jurosPerc" class="form-control" min="0" required />
              </div>
              <div class="form-group">
                <label for="dataInicio">Data de Início</label>
                <input type="date" id="dataInicio" name="dataInicio" class="form-control" required />
              </div>
              <button type="submit" class="btn btn--primary btn--full-width">Salvar</button>
            </form>
          </div>
        </div>
      </div>
    `;
    this.bindEvents();
    this.populateClientesSelect();
  },

  bindEvents() {
    document.getElementById('addEmprestimoBtn').addEventListener('click', () => this.openForm());
    document.getElementById('closeEmprestimoModalBtn').addEventListener('click', () => this.closeForm());
    document.getElementById('emprestimoForm').addEventListener('submit', e => this.onSubmit(e));
  },

  openForm() {
    document.getElementById('emprestimoForm').reset();
    Utils.toggleModal('emprestimoFormModal', true);
    this.populateClientesSelect();
  },

  closeForm() {
    Utils.toggleModal('emprestimoFormModal', false);
  },

  async onSubmit(event) {
    event.preventDefault();
    const clienteId    = document.getElementById('clienteId').value;
    const valorPrincipal = parseFloat(document.getElementById('valorPrincipal').value);
    const jurosPerc    = parseFloat(document.getElementById('jurosPerc').value);
    const dataInicio   = document.getElementById('dataInicio').value;

    if (!clienteId || isNaN(valorPrincipal) || isNaN(jurosPerc) || !dataInicio) {
      Utils.alert('Todos os campos são obrigatórios!', 'error');
      return;
    }

    await sistema.supabase.from('emprestimos').insert([{
      clienteId,
      valorPrincipal,
      jurosPerc,
      dataInicio,
      status: "ativo",
      responsavel_id: sistema.currentUser.id
    }]);

    await sistema.loadEmprestimos(); // Atualiza lista local
    this.closeForm();
    this.loadData();
    Utils.alert('Empréstimo cadastrado com sucesso!', 'info');
  },

  populateClientesSelect() {
    const select = document.getElementById('clienteId');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione...</option>';
    if (sistema.clientes && sistema.clientes.length) {
      sistema.clientes.forEach(cliente => {
        select.innerHTML += `<option value="${cliente.id}">${cliente.nome}</option>`;
      });
    }
  },

  loadData() {
    const tbody = document.getElementById('emprestimosTable').querySelector('tbody');
    if (!sistema.emprestimos.length) {
      tbody.innerHTML = '<tr><td colspan="9">Nenhum empréstimo encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = sistema.emprestimos.map(emp => {
      const cliente = sistema.clientes.find(c => c.id === emp.clienteId) || {};
      const vencimento = Utils.calcularVencimento(emp.dataInicio);
      const valorJuros = Utils.calcularJuros(emp.valorPrincipal, emp.jurosPerc);

      return `
        <tr>
          <td><img src="${cliente.foto || 'https://via.placeholder.com/40'}" alt="${cliente.nome || ''}" width="40" height="40" style="border-radius:8px;" /></td>
          <td>${cliente.nome || '-'}</td>
          <td>${emp.dataInicio ? Utils.formatDateForInput(emp.dataInicio) : '-'}</td>
          <td>${vencimento}</td>
          <td>${Utils.formatCurrency(emp.valorPrincipal)}</td>
          <td>${emp.jurosPerc || '0'}%</td>
          <td>${Utils.formatCurrency(valorJuros)}</td>
          <td><span class="status-badge status-${emp.status}">${emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}</span></td>
          <td>
            <button class="btn btn--sm btn--outline" onclick="alert('Função editar empréstimo não implementada')">Editar</button>
          </td>
        </tr>
      `;
    }).join('');
  }
};
