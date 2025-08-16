const EmprestimosModule = {
  editingEmprestimoId: null,

  render(container) {
    container.innerHTML = `
      <div class="page-header">
        <h2>Controle de Empréstimos</h2>
        <div class="page-controls">
          <button class="btn btn--primary" id="addEmprestimoBtn">Novo Empréstimo</button>
        </div>
      </div>

      <div class="table-container">
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
      </div>

      <!-- Modal Empréstimo -->
      <div id="emprestimoFormModal" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modalTitleEmprestimo">Novo Empréstimo</h3>
            <button class="btn-close" id="closeEmprestimoModalBtn">&times;</button>
          </div>
          <div class="modal-body">
            <form id="emprestimoForm">
              <div class="form-group">
                <label for="clienteId">Cliente *</label>
                <select id="clienteId" name="clienteId" required class="form-control"></select>
              </div>
              <div class="form-group">
                <label for="dataInicio">Data de Início *</label>
                <input type="date" id="dataInicio" name="dataInicio" required class="form-control" />
              </div>
              <div class="form-group">
                <label for="valorPrincipal">Valor Principal (R$) *</label>
                <input type="number" id="valorPrincipal" name="valorPrincipal" min="0" step="0.01" required class="form-control" />
              </div>
              <div class="form-group">
                <label for="jurosPerc">Taxa de Juros (%) *</label>
                <input type="number" id="jurosPerc" name="jurosPerc" min="0" step="0.01" required class="form-control" />
              </div>
              <div class="form-group">
                <label for="observacoes">Observações</label>
                <textarea id="observacoes" name="observacoes" class="form-control" rows="3" placeholder="Detalhes adicionais"></textarea>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn--secondary" onclick="EmprestimosModule.closeForm()">Cancelar</button>
                <button type="submit" class="btn btn--primary">Salvar Empréstimo</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal Pagamento -->
      <div id="pagamentoModal" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Registrar Pagamento</h3>
            <button class="btn-close" onclick="EmprestimosModule.closePagamentoModal()">&times;</button>
          </div>
          <div class="modal-body">
            <form id="pagamentoForm">
              <input type="hidden" id="pagamentoEmprestimoId" />
              <input type="hidden" id="pagamentoClienteId" />
              <div class="form-group">
                <label for="tipoPagamento">Tipo de Pagamento *</label>
                <select id="tipoPagamento" name="tipoPagamento" required class="form-control">
                  <option value="juros">Pagamento de Juros</option>
                  <option value="quitacao">Quitação Total</option>
                </select>
              </div>
              <div class="form-group">
                <label for="valorPagamento">Valor Pago (R$) *</label>
                <input type="number" id="valorPagamento" name="valorPagamento" min="0" step="0.01" required class="form-control" />
              </div>
              <div class="form-group">
                <label for="dataPagamento">Data do Pagamento *</label>
                <input type="date" id="dataPagamento" name="dataPagamento" required class="form-control" />
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn--secondary" onclick="EmprestimosModule.closePagamentoModal()">Cancelar</button>
                <button type="submit" class="btn btn--success">Registrar Pagamento</button>
              </div>
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
    document.getElementById('emprestimoForm').addEventListener('submit', (e) => this.onSubmit(e));
    document.getElementById('pagamentoForm').addEventListener('submit', (e) => this.onPagamentoSubmit(e));
  },

  populateClientesSelect() {
    const select = document.getElementById('clienteId');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um cliente...</option>';
    sistema.clientes.forEach(cliente => {
      select.innerHTML += `<option value="${cliente.id}">${cliente.nome}</option>`;
    });
  },

  openForm(emprestimo = null) {
    this.editingEmprestimoId = emprestimo ? emprestimo.id : null;
    document.getElementById('modalTitleEmprestimo').textContent = emprestimo ? 'Editar Empréstimo' : 'Novo Empréstimo';

    if (emprestimo) {
      document.getElementById('clienteId').value = emprestimo.clienteId || '';
      document.getElementById('dataInicio').value = emprestimo.dataInicio ? emprestimo.dataInicio.split('T')[0] : '';
      document.getElementById('valorPrincipal').value = emprestimo.valorPrincipal || '';
      document.getElementById('jurosPerc').value = emprestimo.jurosPerc || '';
      document.getElementById('observacoes').value = emprestimo.observacoes || '';
    } else {
      document.getElementById('emprestimoForm').reset();
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('dataInicio').value = today;
    }
    this.toggleModal(true);
  },

  closeForm() {
    this.toggleModal(false);
  },

  toggleModal(show) {
    const modal = document.getElementById('emprestimoFormModal');
    if (show) modal.classList.remove('hidden');
    else modal.classList.add('hidden');
  },

  async onSubmit(event) {
    event.preventDefault();

    const clienteId = document.getElementById('clienteId').value;
    const dataInicio = document.getElementById('dataInicio').value;
    const valorPrincipal = parseFloat(document.getElementById('valorPrincipal').value);
    const jurosPerc = parseFloat(document.getElementById('jurosPerc').value);
    const observacoes = document.getElementById('observacoes').value.trim();

    if (!clienteId || !dataInicio || isNaN(valorPrincipal) || isNaN(jurosPerc)) {
      alert('Por favor, preencha os campos obrigatórios corretamente.');
      return;
    }

    const emprestimoData = {
      clienteId,
      dataInicio,
      valorPrincipal,
      jurosPerc,
      observacoes,
      status: 'ativo',
      responsavel_id: sistema.currentUser.id
    };

    try {
      if (this.editingEmprestimoId) {
        await sistema.supabase.from('emprestimos').update(emprestimoData).eq('id', this.editingEmprestimoId);
      } else {
        await sistema.supabase.from('emprestimos').insert([emprestimoData]);
      }
      await sistema.loadEmprestimos();
      this.closeForm();
      this.loadData();
    } catch (error) {
      alert('Erro ao salvar empréstimo.');
      console.error(error);
    }
  },

  openPagamentoModal(emprestimoId) {
    const emprestimo = sistema.emprestimos.find(e => e.id === emprestimoId);
    if (!emprestimo) {
      alert('Empréstimo não encontrado.');
      return;
    }

    document.getElementById('pagamentoEmprestimoId').value = emprestimo.id;
    document.getElementById('pagamentoClienteId').value = emprestimo.clienteId;

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dataPagamento').value = today;

    this.togglePagamentoModal(true);
  },

  togglePagamentoModal(show) {
    const modal = document.getElementById('pagamentoModal');
    if (show) modal.classList.remove('hidden');
    else modal.classList.add('hidden');
  },

  async onPagamentoSubmit(event) {
    event.preventDefault();

    const emprestimoId = document.getElementById('pagamentoEmprestimoId').value;
    const clienteId = document.getElementById('pagamentoClienteId').value;
    const tipoPagamento = document.getElementById('tipoPagamento').value;
    const valorPagamento = parseFloat(document.getElementById('valorPagamento').value);
    const dataPagamento = document.getElementById('dataPagamento').value;

    if (!emprestimoId || !clienteId || !tipoPagamento || isNaN(valorPagamento) || !dataPagamento) {
      alert('Preencha todos os campos de pagamento corretamente.');
      return;
    }

    try {
      await sistema.supabase.from('historico_pagamentos').insert([
        {
          emprestimo_id: emprestimoId,
          cliente_id: clienteId,
          tipo: tipoPagamento,
          valor: valorPagamento,
          dataPagamento,
          responsavel_id: sistema.currentUser.id
        }
      ]);

      if (tipoPagamento === 'quitacao') {
        await sistema.supabase.from('emprestimos').update({ status: 'quitado' }).eq('id', emprestimoId);
      }
      await sistema.loadEmprestimos();
      await sistema.loadHistorico();
      this.togglePagamentoModal(false);
      this.loadData();
    } catch (error) {
      alert('Erro ao registrar pagamento.');
      console.error(error);
    }
  },

  loadData() {
    const tbody = document.querySelector('#emprestimosTable tbody');
    if (!tbody) return;
    if (!sistema.currentUser) return;

    const emprestimosVisiveis = sistema.emprestimos.filter(emp => emp.status === 'ativo');

    if (emprestimosVisiveis.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9">Nenhum empréstimo encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = emprestimosVisiveis.map(emp => {
      const cliente = sistema.clientes.find(c => c.id === emp.clienteId) || {};
      const vencimento = emp.dataInicio ? new Date(emp.dataInicio) : null;
      if (vencimento) vencimento.setMonth(vencimento.getMonth() + 1);
      const valorJuros = (emp.valorPrincipal * emp.jurosPerc) / 100;
      const podeEditar = sistema.currentUser.role === 'admin' || sistema.currentUser.id === emp.responsavel_id;

      return `
        <tr>
          <td><img src="${cliente.foto || 'https://via.placeholder.com/40'}" alt="foto" style="width:40px; height: 40px; border-radius: 50%;" /></td>
          <td>${cliente.nome || '-'}</td>
          <td>${emp.dataInicio ? new Date(emp.dataInicio).toLocaleDateString() : '-'}</td>
          <td>${vencimento ? vencimento.toLocaleDateString() : '-'}</td>
          <td>${emp.valorPrincipal.toFixed(2)}</td>
          <td>${emp.jurosPerc.toFixed(2)}%</td>
          <td>${valorJuros.toFixed(2)}</td>
          <td>${emp.status}</td>
          <td>
            ${podeEditar ? `<button onclick="EmprestimosModule.openForm(${JSON.stringify(emp)})" class="btn btn--sm">Editar</button>
            <button onclick="EmprestimosModule.openPagamentoModal('${emp.id}')" class="btn btn--success btn--sm">💰</button>` : '-'}
          </td>
        </tr>
      `;
    }).join('');
  }
};
