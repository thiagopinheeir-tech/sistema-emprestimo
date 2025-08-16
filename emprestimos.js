// Módulo Empréstimos
// ==================

const EmprestimosModule = {
  editingEmprestimoId: null,

  // Renderizar HTML da página de empréstimos
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

      <!-- Modal de Cadastro/Edição -->
      <div id="emprestimoFormModal" class="modal hidden">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modalTitleEmprestimo">Novo Empréstimo</h3>
            <button class="btn-close" id="closeEmprestimoModalBtn">&times;</button>
          </div>
          <div class="modal-body">
            <form id="emprestimoForm">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="clienteId">Cliente *</label>
                  <select id="clienteId" name="clienteId" class="form-control" required>
                    <option value="">Selecione um cliente...</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="dataInicio">Data de Início *</label>
                  <input type="date" id="dataInicio" name="dataInicio" class="form-control" required />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="valorPrincipal">Valor Principal (R$) *</label>
                  <input type="number" id="valorPrincipal" name="valorPrincipal" class="form-control" min="1" step="0.01" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="jurosPerc">Taxa de Juros (%) *</label>
                  <input type="number" id="jurosPerc" name="jurosPerc" class="form-control" min="0" step="0.01" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="observacoes">Observações</label>
                <textarea id="observacoes" name="observacoes" class="form-control" rows="3" placeholder="Informações adicionais sobre o empréstimo"></textarea>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn--secondary" onclick="EmprestimosModule.closeForm()">Cancelar</button>
                <button type="submit" class="btn btn--primary">Salvar Empréstimo</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal de Pagamento -->
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
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="tipoPagamento">Tipo de Pagamento *</label>
                  <select id="tipoPagamento" name="tipoPagamento" class="form-control" required>
                    <option value="juros">Pagamento de Juros</option>
                    <option value="quitacao">Quitação Total</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="valorPagamento">Valor Pago (R$) *</label>
                  <input type="number" id="valorPagamento" name="valorPagamento" class="form-control" min="0.01" step="0.01" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="dataPagamento">Data do Pagamento *</label>
                <input type="date" id="dataPagamento" name="dataPagamento" class="form-control" required />
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
    document.getElementById('emprestimoForm').addEventListener('submit', e => this.onSubmit(e));
    document.getElementById('pagamentoForm').addEventListener('submit', e => this.onPagamentoSubmit(e));

    // Atualizar data de início para hoje por padrão
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataInicio').value = hoje;
    document.getElementById('dataPagamento').value = hoje;
  },

  openForm(emprestimo = null) {
    this.editingEmprestimoId = emprestimo ? emprestimo.id : null;
    document.getElementById('modalTitleEmprestimo').textContent = emprestimo ? 'Editar Empréstimo' : 'Novo Empréstimo';

    if (emprestimo) {
      document.getElementById('clienteId').value = emprestimo.clienteId || '';
      document.getElementById('valorPrincipal').value = emprestimo.valorPrincipal || '';
      document.getElementById('jurosPerc').value = emprestimo.jurosPerc || '';
      document.getElementById('dataInicio').value = emprestimo.dataInicio ? Utils.formatDateForInput(emprestimo.dataInicio) : '';
      document.getElementById('observacoes').value = emprestimo.observacoes || '';
    } else {
      document.getElementById('emprestimoForm').reset();
      const hoje = new Date().toISOString().split('T')[0];
      document.getElementById('dataInicio').value = hoje;
    }

    this.populateClientesSelect();
    Utils.toggleModal('emprestimoFormModal', true);
  },

  closeForm() {
    Utils.toggleModal('emprestimoFormModal', false);
  },

  openPagamentoModal(emprestimoId) {
    const emprestimo = sistema.emprestimos.find(e => e.id === emprestimoId);
    if (!emprestimo) {
      Utils.alert('Empréstimo não encontrado.', 'error');
      return;
    }

    const cliente = sistema.clientes.find(c => c.id === emprestimo.clienteId);
    if (!cliente) {
      Utils.alert('Cliente não encontrado.', 'error');
      return;
    }

    document.getElementById('pagamentoEmprestimoId').value = emprestimoId;
    document.getElementById('pagamentoClienteId').value = emprestimo.clienteId;

    // Calcular valor sugerido (juros do mês)
    const valorJuros = Utils.calcularJuros(emprestimo.valorPrincipal, emprestimo.jurosPerc);
    document.getElementById('valorPagamento').value = valorJuros.toFixed(2);

    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataPagamento').value = hoje;

    Utils.toggleModal('pagamentoModal', true);
  },

  closePagamentoModal() {
    Utils.toggleModal('pagamentoModal', false);
  },

  async onSubmit(event) {
    event.preventDefault();

    const clienteId = document.getElementById('clienteId').value;
    const valorPrincipal = parseFloat(document.getElementById('valorPrincipal').value);
    const jurosPerc = parseFloat(document.getElementById('jurosPerc').value);
    const dataInicio = document.getElementById('dataInicio').value;
    const observacoes = document.getElementById('observacoes').value.trim();

    if (!clienteId || isNaN(valorPrincipal) || isNaN(jurosPerc) || !dataInicio) {
      Utils.alert('Todos os campos obrigatórios devem ser preenchidos!', 'error');
      return;
    }

    const emprestimoData = {
      clienteId,
      valorPrincipal,
      jurosPerc,
      dataInicio,
      observacoes,
      status: 'ativo'
    };

    try {
      if (this.editingEmprestimoId) {
        // Atualizar empréstimo existente
        await sistema.supabase.from('emprestimos')
          .update(emprestimoData)
          .eq('id', this.editingEmprestimoId);
        
        Utils.alert('Empréstimo atualizado com sucesso!', 'success');
      } else {
        // Criar novo empréstimo
        await sistema.addEmprestimo(emprestimoData);
        Utils.alert('Empréstimo cadastrado com sucesso!', 'success');
      }

      this.closeForm();
      this.loadData();
    } catch (error) {
      console.error('Erro ao salvar empréstimo:', error);
      Utils.alert('Erro ao salvar empréstimo. Tente novamente.', 'error');
    }
  },

  async onPagamentoSubmit(event) {
    event.preventDefault();

    const emprestimoId = document.getElementById('pagamentoEmprestimoId').value;
    const clienteId = document.getElementById('pagamentoClienteId').value;
    const tipoPagamento = document.getElementById('tipoPagamento').value;
    const valorPagamento = parseFloat(document.getElementById('valorPagamento').value);
    const dataPagamento = document.getElementById('dataPagamento').value;

    if (!emprestimoId || !clienteId || !tipoPagamento || isNaN(valorPagamento) || !dataPagamento) {
      Utils.alert('Todos os campos são obrigatórios!', 'error');
      return;
    }

    try {
      // Registrar pagamento no histórico
      await sistema.addHistoricoPagamento({
        emprestimo_id: emprestimoId,
        cliente_id: clienteId,
        valor: valorPagamento,
        tipo: tipoPagamento,
        dataPagamento
      });

      // Se foi quitação, atualizar status do empréstimo
      if (tipoPagamento === 'quitacao') {
        await sistema.supabase.from('emprestimos')
          .update({ status: 'quitado' })
          .eq('id', emprestimoId);
        
        // Recarregar empréstimos
        await sistema.loadEmprestimos();
      }

      Utils.alert('Pagamento registrado com sucesso!', 'success');
      this.closePagamentoModal();
      this.loadData();

    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      Utils.alert('Erro ao registrar pagamento. Tente novamente.', 'error');
    }
  },

  populateClientesSelect() {
    const select = document.getElementById('clienteId');
    if (!select) return;

    select.innerHTML = '<option value="">Selecione um cliente...</option>';
    
    const clientesDisponiveis = sistema.getFilteredClientes().filter(c => c.status === 'ativo');
    
    if (clientesDisponiveis.length === 0) {
      select.innerHTML = '<option value="">Nenhum cliente ativo encontrado</option>';
      return;
    }

    clientesDisponiveis.forEach(cliente => {
      select.innerHTML += `<option value="${cliente.id}">${cliente.nome}</option>`;
    });
  },

  loadData() {
    const tbody = document.getElementById('emprestimosTable').querySelector('tbody');
    const emprestimos = this.getFilteredEmprestimos();

    if (!emprestimos.length) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--color-text-secondary);">Nenhum empréstimo encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = emprestimos.map(emprestimo => {
      const cliente = sistema.clientes.find(c => c.id === emprestimo.clienteId) || {};
      const vencimento = Utils.calcularVencimento(emprestimo.dataInicio);
      const valorJuros = Utils.calcularJuros(emprestimo.valorPrincipal, emprestimo.jurosPerc);
      const diasAtraso = Utils.calcularAtraso(emprestimo);
      const canEdit = sistema.canEditClient(emprestimo.clienteId);

      return `
        <tr>
          <td>
            <img src="${cliente.foto || 'https://via.placeholder.com/40x40?text=👤'}" 
                 alt="${cliente.nome || 'Cliente'}" 
                 class="client-photo" 
                 onerror="this.src='https://via.placeholder.com/40x40?text=👤'" />
          </td>
          <td><strong>${cliente.nome || 'Cliente não encontrado'}</strong></td>
          <td>${emprestimo.dataInicio ? Utils.formatDateForInput(emprestimo.dataInicio) : '-'}</td>
          <td>
            ${vencimento}
            ${diasAtraso > 0 ? `<br><small style="color: var(--color-error);">${diasAtraso} dias em atraso</small>` : ''}
          </td>
          <td><strong>${Utils.formatCurrency(emprestimo.valorPrincipal)}</strong></td>
          <td>${emprestimo.jurosPerc || '0'}%</td>
          <td><strong>${Utils.formatCurrency(valorJuros)}</strong></td>
          <td>
            <span class="status-badge status-${emprestimo.status}">
              ${emprestimo.status.charAt(0).toUpperCase() + emprestimo.status.slice(1)}
            </span>
          </td>
          <td>
            ${canEdit ? `
              <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                ${emprestimo.status === 'ativo' ? `
                  <button class="btn btn--sm btn--success" onclick="EmprestimosModule.openPagamentoModal('${emprestimo.id}')" title="Registrar Pagamento">
                    💰
                  </button>
                  <button class="btn btn--sm btn--info" onclick="Utils.enviarCobrancaWhatsApp('${emprestimo.id}')" title="Enviar Cobrança">
                    📱
                  </button>
                ` : ''}
                <button class="btn btn--sm btn--secondary" onclick="EmprestimosModule.openForm(${JSON.stringify(emprestimo).replace(/"/g, '&quot;')})" title="Editar">
                  ✏️
                </button>
              </div>
            ` : '-'}
          </td>
        </tr>
      `;
    }).join('');
  },

  // Obter empréstimos filtrados por permissão
  getFilteredEmprestimos() {
    if (sistema.currentUser.role === 'admin') {
      return sistema.emprestimos;
    }
    
    const clientesPermitidos = sistema.getFilteredClientes().map(c => c.id);
    return sistema.emprestimos.filter(e => clientesPermitidos.includes(e.clienteId));
  },

  // Buscar empréstimo por ID
  getEmprestimoById(id) {
    return sistema.emprestimos.find(e => e.id === id);
  }
};