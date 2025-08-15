// Módulo Empréstimos
// ==================

const EmprestimosModule = {
    
    // Renderizar HTML da página de empréstimos
    render(container) {
        container.innerHTML = `
            <div class="page emprestimos-page active" id="emprestimos">
                <div class="page-header">
                    <h2>Tabela de Empréstimos</h2>
                    <div class="page-controls">
                        <select class="form-control" id="filtroStatus">
                            <option value="ativos">Ativos</option>
                            <option value="todos">Todos</option>
                            <option value="quitados">Quitados</option>
                        </select>
                        <button class="btn btn--primary" id="novoEmprestimoBtn">Novo Empréstimo</button>
                    </div>
                </div>

                <!-- Modal Novo Empréstimo -->
                <div class="modal hidden" id="emprestimoModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Novo Empréstimo</h3>
                            <button class="btn-close" id="closeModalBtn">×</button>
                        </div>
                        <form class="modal-body" id="emprestimoForm">
                            <div class="form-group">
                                <label class="form-label">Cliente *</label>
                                <select class="form-control" id="emprestimoCliente" required>
                                    <option value="">Selecione um cliente</option>
                                </select>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Valor Principal *</label>
                                    <input type="number" class="form-control" id="emprestimoValor" step="0.01" placeholder="0,00" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Taxa de Juros (%) *</label>
                                    <input type="number" class="form-control" id="emprestimoJuros" step="0.01" placeholder="0,00" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Data de Início *</label>
                                <input type="date" class="form-control" id="emprestimoData" required>
                            </div>
                            <div class="form-info">
                                <p><strong>Valor dos Juros:</strong> <span id="valorJurosCalc">R$ 0,00</span></p>
                                <p><strong>Data de Vencimento:</strong> <span id="dataVencimentoCalc">-</span></p>
                            </div>
                        </form>
                        <div class="modal-footer">
                            <button type="submit" form="emprestimoForm" class="btn btn--primary">Criar Empréstimo</button>
                            <button type="button" class="btn btn--secondary" id="cancelModalBtn">Cancelar</button>
                        </div>
                    </div>
                </div>

                <!-- Tabela de Empréstimos -->
                <div class="table-container">
                    <table class="table" id="emprestimosTable">
                        <thead>
                            <tr>
                                <th>Foto</th>
                                <th>Cliente</th>
                                <th class="admin-only manager-only hidden">Responsável</th>
                                <th>Data Início</th>
                                <th>Vencimento</th>
                                <th>Valor Principal</th>
                                <th>Juros %</th>
                                <th>Valor Juros</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="emprestimosTableBody">
                            <tr><td colspan="10">Carregando empréstimos...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.bindEvents();
    },

    // Carregar dados
    loadData() {
        this.loadEmprestimos();
        this.populateClienteSelect();
    },

    // Carregar lista de empréstimos
    loadEmprestimos() {
        const filtro = document.getElementById('filtroStatus').value;
        let emprestimosFiltrados = sistema.getFilteredEmprestimos();

        // Aplicar filtro
        if (filtro === 'ativos') {
            emprestimosFiltrados = emprestimosFiltrados.filter(e => e.status === 'ativo');
        } else if (filtro === 'quitados') {
            emprestimosFiltrados = emprestimosFiltrados.filter(e => e.status === 'quitado');
        }

        const tbody = document.getElementById('emprestimosTableBody');
        if (emprestimosFiltrados.length === 0) {
            const colspan = sistema.currentUser.role === 'operator' ? '9' : '10';
            tbody.innerHTML = `<tr><td colspan="${colspan}">Nenhum empréstimo encontrado</td></tr>`;
            return;
        }

        tbody.innerHTML = emprestimosFiltrados.map(emp => {
            const cliente = sistema.clientes.find(c => c.id === emp.clienteId);
            const responsavel = sistema.users.find(u => u.id === emp.responsavelId);
            const vencimento = Utils.calcularVencimento(emp.dataInicio);
            const valorJuros = Utils.calcularJuros(emp.valorPrincipal, emp.jurosPerc);
            const canEdit = sistema.canEditClient(emp.clienteId);
            const diasAtraso = Utils.calcularAtraso(emp);
            const temContato = cliente && cliente.contato && cliente.contato.trim() !== '';

            return `
                <tr>
                    <td>
                        ${cliente && cliente.foto ? `<img src="${cliente.foto}" class="client-photo" alt="${cliente.nome}">` : '-'}
                    </td>
                    <td>${cliente ? cliente.nome : '-'}</td>
                    ${sistema.currentUser.role !== 'operator' ? `<td>${responsavel ? responsavel.name : '-'}</td>` : ''}
                    <td>${new Date(emp.dataInicio).toLocaleDateString('pt-BR')}</td>
                    <td>${vencimento}</td>
                    <td>${Utils.formatCurrency(emp.valorPrincipal)}</td>
                    <td>${emp.jurosPerc}%</td>
                    <td>${Utils.formatCurrency(valorJuros)}</td>
                    <td><span class="status-badge status-${emp.status === 'ativo' ? 'ativo' : 'inativo'}">${emp.status}</span></td>
                    <td>
                        ${canEdit && emp.status === 'ativo' ? `
                            <button class="btn btn--sm btn--warning" onclick="EmprestimosModule.pagarJuros('${emp.id}')">
                                Pagar Juros
                            </button>
                            <button class="btn btn--sm btn--success" onclick="EmprestimosModule.quitarEmprestimo('${emp.id}')">
                                Quitar
                            </button>
                            ${diasAtraso >= 0 && temContato ? `
                                <button class="btn btn--sm btn--info" onclick="Utils.enviarCobrancaWhatsApp('${emp.id}')" style="background-color: #25D366;">
                                    📱 WhatsApp
                                </button>
                            ` : ''}
                        ` : ''}
                        ${canEdit ? `
                            <button class="btn btn--sm btn--danger" onclick="EmprestimosModule.removerEmprestimo('${emp.id}')">
                                Remover
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },

    // Popular select de cliente
    populateClienteSelect() {
        const select = document.getElementById('emprestimoCliente');
        if (!select) return;

        const clientesPermitidos = sistema.getFilteredClientes().filter(c => c.status === 'ativo');
        select.innerHTML = '<option value="">Selecione um cliente</option>' +
            clientesPermitidos.map(cliente => `
                <option value="${cliente.id}">${cliente.nome}</option>
            `).join('');
    },

    // Adicionar empréstimo
    addEmprestimo(emprestimoData) {
        const cliente = sistema.clientes.find(c => c.id === emprestimoData.clienteId);
        if (!cliente || !sistema.canViewClient(cliente.id)) {
            Utils.alert('Cliente não encontrado ou sem permissão.');
            return;
        }

        const newEmprestimo = {
            id: Utils.generateId('emp_'),
            ...emprestimoData,
            valorPrincipal: parseFloat(emprestimoData.valorPrincipal),
            jurosPerc: parseFloat(emprestimoData.jurosPerc),
            status: 'ativo',
            responsavelId: cliente.responsavelId,
            pagamentos: []
        };

        sistema.emprestimos.push(newEmprestimo);
        this.loadEmprestimos();
        Utils.alert('Empréstimo criado com sucesso!');
        return newEmprestimo;
    },

    // Pagar juros
    pagarJuros(emprestimoId) {
        const emprestimo = sistema.emprestimos.find(e => e.id === emprestimoId);
        if (!emprestimo || !sistema.canEditClient(emprestimo.clienteId)) {
            Utils.alert('Empréstimo não encontrado ou sem permissão.');
            return;
        }

        const valorJuros = Utils.calcularJuros(emprestimo.valorPrincipal, emprestimo.jurosPerc);

        // Confirmar pagamento
        Utils.confirm(`Confirmar pagamento de juros de ${Utils.formatCurrency(valorJuros)}?`, () => {
            // Registrar pagamento
            const pagamento = {
                data: new Date().toISOString(),
                tipo: 'juros',
                valor: valorJuros
            };

            emprestimo.pagamentos.push(pagamento);

            // Atualizar data de início (próximo mês)
            const novaData = new Date(emprestimo.dataInicio);
            novaData.setMonth(novaData.getMonth() + 1);
            emprestimo.dataInicio = novaData.toISOString().split('T')[0];

            // Adicionar ao histórico
            sistema.historicoPagamentos.push({
                id: Utils.generateId('hist_'),
                clienteId: emprestimo.clienteId,
                emprestimoId: emprestimo.id,
                valorPago: valorJuros,
                tipo: 'juros',
                dataPagamento: new Date().toISOString(),
                responsavelId: sistema.currentUser.id
            });

            Utils.alert(`Juros de ${Utils.formatCurrency(valorJuros)} registrados com sucesso!`);
            this.loadEmprestimos();

            // Atualizar dashboard se ativo
            if (sistema.currentPage === 'dashboard') {
                DashboardModule.loadData();
            }
        });
    },

    // Quitar empréstimo
    quitarEmprestimo(emprestimoId) {
        const emprestimo = sistema.emprestimos.find(e => e.id === emprestimoId);
        if (!emprestimo || !sistema.canEditClient(emprestimo.clienteId)) {
            Utils.alert('Empréstimo não encontrado ou sem permissão.');
            return;
        }

        const cliente = sistema.clientes.find(c => c.id === emprestimo.clienteId);
        
        // Calcular valores
        const jurosAcumulados = emprestimo.pagamentos
            .filter(p => p.tipo === 'juros')
            .reduce((sum, p) => sum + p.valor, 0);

        const jurosUltimoMes = Utils.calcularJuros(emprestimo.valorPrincipal, emprestimo.jurosPerc);
        const valorQuitacao = emprestimo.valorPrincipal + jurosUltimoMes;
        const totalPago = jurosAcumulados + valorQuitacao;

        Utils.confirm(
            `Confirmar quitação do empréstimo de ${cliente ? cliente.nome : 'cliente'}?\n\nValor da quitação: ${Utils.formatCurrency(valorQuitacao)}\nTotal pago no empréstimo: ${Utils.formatCurrency(totalPago)}`, 
            () => {
                // Adicionar ao histórico
                sistema.historicoPagamentos.push({
                    id: Utils.generateId('hist_'),
                    clienteId: emprestimo.clienteId,
                    emprestimoId: emprestimo.id,
                    valorPago: valorQuitacao,
                    tipo: 'quitacao',
                    dataPagamento: new Date().toISOString(),
                    totalPago: totalPago,
                    responsavelId: sistema.currentUser.id
                });

                // Remover empréstimo da lista
                sistema.emprestimos = sistema.emprestimos.filter(e => e.id !== emprestimoId);

                Utils.alert(`Empréstimo quitado! Total pago: ${Utils.formatCurrency(totalPago)}`);
                this.loadEmprestimos();

                // Atualizar dashboard se ativo
                if (sistema.currentPage === 'dashboard') {
                    DashboardModule.loadData();
                }
            }
        );
    },

    // Remover empréstimo
    removerEmprestimo(id) {
        const emprestimo = sistema.emprestimos.find(e => e.id === id);
        if (!emprestimo || !sistema.canEditClient(emprestimo.clienteId)) {
            Utils.alert('Empréstimo não encontrado ou sem permissão.');
            return;
        }

        const cliente = sistema.clientes.find(c => c.id === emprestimo.clienteId);
        Utils.confirm(`Tem certeza que deseja remover o empréstimo de ${cliente ? cliente.nome : 'cliente'}?`, () => {
            sistema.emprestimos = sistema.emprestimos.filter(e => e.id !== id);
            this.loadEmprestimos();
            Utils.alert('Empréstimo removido com sucesso!');

            // Atualizar dashboard se ativo
            if (sistema.currentPage === 'dashboard') {
                DashboardModule.loadData();
            }
        });
    },

    // Atualizar cálculos ao digitar
    updateCalculations() {
        const valor = parseFloat(document.getElementById('emprestimoValor').value) || 0;
        const juros = parseFloat(document.getElementById('emprestimoJuros').value) || 0;
        const data = document.getElementById('emprestimoData').value;

        const valorJuros = Utils.calcularJuros(valor, juros);
        document.getElementById('valorJurosCalc').textContent = Utils.formatCurrency(valorJuros);

        if (data) {
            document.getElementById('dataVencimentoCalc').textContent = Utils.calcularVencimento(data);
        } else {
            document.getElementById('dataVencimentoCalc').textContent = '-';
        }
    },

    // Bind eventos
    bindEvents() {
        // Filtro de status
        document.getElementById('filtroStatus')?.addEventListener('change', () => {
            this.loadEmprestimos();
        });

        // Novo empréstimo
        document.getElementById('novoEmprestimoBtn')?.addEventListener('click', () => {
            Utils.toggleModal('emprestimoModal', true);
        });

        // Fechar modal
        document.getElementById('closeModalBtn')?.addEventListener('click', () => {
            Utils.toggleModal('emprestimoModal', false);
        });

        // Cancelar modal
        document.getElementById('cancelModalBtn')?.addEventListener('click', () => {
            Utils.toggleModal('emprestimoModal', false);
        });

        // Auto-cálculo de juros e vencimento
        const valorInput = document.getElementById('emprestimoValor');
        const jurosInput = document.getElementById('emprestimoJuros');
        const dataInput = document.getElementById('emprestimoData');

        valorInput?.addEventListener('input', () => this.updateCalculations());
        jurosInput?.addEventListener('input', () => this.updateCalculations());
        dataInput?.addEventListener('change', () => this.updateCalculations());

        // Submit formulário
        document.getElementById('emprestimoForm')?.addEventListener('submit', (e) => {
            e.preventDefault();

            const emprestimoData = {
                clienteId: document.getElementById('emprestimoCliente').value,
                valorPrincipal: document.getElementById('emprestimoValor').value,
                jurosPerc: document.getElementById('emprestimoJuros').value,
                dataInicio: document.getElementById('emprestimoData').value
            };

            if (!emprestimoData.clienteId) {
                Utils.alert('Selecione um cliente.');
                return;
            }

            this.addEmprestimo(emprestimoData);
            
            // Limpar formulário e fechar modal
            Utils.toggleModal('emprestimoModal', false);
            Utils.clearForm('emprestimoForm');
            document.getElementById('valorJurosCalc').textContent = 'R$ 0,00';
            document.getElementById('dataVencimentoCalc').textContent = '-';
        });
    }
};