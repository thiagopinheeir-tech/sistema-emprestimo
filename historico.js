// Módulo Histórico Profissional - Versão 2.0

const HistoricoModule = {

    render(container) {
        container.innerHTML = `
            <div class="page historico-page active" id="historico">
                <div class="page-header">
                    <h2>Histórico de Pagamentos</h2>
                </div>

                <div class="form-container">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="searchCliente">Pesquisar Cliente</label>
                            <input type="text" class="form-control" id="searchCliente" placeholder="Digite o nome do cliente" />
                        </div>
                        <div class="form-group">
                            <label for="filtroTipo">Tipo de Pagamento</label>
                            <select class="form-control" id="filtroTipo">
                                <option value="">Todos</option>
                                <option value="juros">Juros</option>
                                <option value="quitacao">Quitação</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="dataInicial">Data Inicial</label>
                            <input type="date" class="form-control" id="dataInicial" />
                        </div>
                        <div class="form-group">
                            <label for="dataFinal">Data Final</label>
                            <input type="date" class="form-control" id="dataFinal" />
                        </div>
                    </div>
                    <div class="form-actions">
                        <button class="btn btn--primary" id="aplicarFiltros">Aplicar Filtros</button>
                        <button class="btn btn--secondary" id="limparFiltros">Limpar Filtros</button>
                    </div>
                </div>

                <div class="metrics-section">
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-icon">📊</div>
                            <div class="metric-info">
                                <h3>Total de Registros</h3>
                                <p class="metric-value" id="totalRegistros">0</p>
                            </div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">💰</div>
                            <div class="metric-info">
                                <h3>Total em Juros</h3>
                                <p class="metric-value" id="totalJuros">R$ 0,00</p>
                            </div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">✅</div>
                            <div class="metric-info">
                                <h3>Total em Quitações</h3>
                                <p class="metric-value" id="totalQuitacoes">R$ 0,00</p>
                            </div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">🎯</div>
                            <div class="metric-info">
                                <h3>Total Geral</h3>
                                <p class="metric-value" id="totalGeral">R$ 0,00</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="table-container">
                    <table class="table" id="historicoTable">
                        <thead>
                            <tr>
                                <th>Foto</th>
                                <th>Cliente</th>
                                <th>Empréstimo</th>
                                <th>Tipo</th>
                                <th>Valor Pago</th>
                                <th>Data Pagamento</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="historicoTableBody">
                            <tr><td colspan="7">Carregando histórico...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('aplicarFiltros')?.addEventListener('click', () => this.loadData());
        document.getElementById('limparFiltros')?.addEventListener('click', () => this.limparFiltros());
        document.getElementById('searchCliente')?.addEventListener('input', Utils.debounce(() => this.loadData(), 300));
        document.getElementById('filtroTipo')?.addEventListener('change', () => this.loadData());
        document.getElementById('dataInicial')?.addEventListener('change', () => this.loadData());
        document.getElementById('dataFinal')?.addEventListener('change', () => this.loadData());
    },

    loadData() {
        let historico = sistema.getFilteredHistorico();

        const search = document.getElementById('searchCliente')?.value.toLowerCase() || '';
        if(search) {
            historico = historico.filter(h => {
                const c = sistema.clientes.find(cli => cli.id === h.clienteId);
                return c?.nome.toLowerCase().includes(search);
            });
        }

        const tipo = document.getElementById('filtroTipo')?.value || '';
        if(tipo) historico = historico.filter(h => h.tipo === tipo);

        const dataInicio = document.getElementById('dataInicial')?.value;
        if(dataInicio) historico = historico.filter(h => new Date(h.dataPagamento) >= new Date(dataInicio));

        const dataFim = document.getElementById('dataFinal')?.value;
        if(dataFim) historico = historico.filter(h => new Date(h.dataPagamento) <= new Date(dataFim));

        const totalRegistros = historico.length;
        const totalJuros = historico.filter(h => h.tipo === 'juros').reduce((acc, cur) => acc + cur.valorPago, 0);
        const totalQuitacoes = historico.filter(h => h.tipo === 'quitacao').reduce((acc, cur) => acc + cur.valorPago, 0);
        const totalGeral = totalJuros + totalQuitacoes;

        document.getElementById('totalRegistros').textContent = totalRegistros;
        document.getElementById('totalJuros').textContent = Utils.formatCurrency(totalJuros);
        document.getElementById('totalQuitacoes').textContent = Utils.formatCurrency(totalQuitacoes);
        document.getElementById('totalGeral').textContent = Utils.formatCurrency(totalGeral);

        const tbody = document.getElementById('historicoTableBody');
        if(historico.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">Nenhum registro encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = historico.map(reg => {
            const cliente = sistema.clientes.find(c => c.id === reg.clienteId);
            return `<tr>
                <td>${cliente?.foto ? `<img src="${cliente.foto}" class="client-photo" alt="${cliente.nome}">` : '-'}</td>
                <td>${cliente?.nome || '-'}</td>
                <td>${reg.emprestimoId || '-'}</td>
                <td>${reg.tipo}</td>
                <td>${Utils.formatCurrency(reg.valorPago)}</td>
                <td>${new Date(reg.dataPagamento).toLocaleDateString('pt-BR')}</td>
                <td><button class="btn btn--sm btn--danger" onclick="HistoricoModule.removerRegistro('${reg.id}')">Remover</button></td>
            </tr>`;
        }).join('');
    },

    removerRegistro(id) {
        if(!confirm('Confirma remoção do registro?')) return;
        sistema.historicoPagamentos = sistema.historicoPagamentos.filter(r => r.id !== id);
        this.loadData();
    },

    limparFiltros() {
        document.getElementById('searchCliente').value = '';
        document.getElementById('filtroTipo').value = '';
        document.getElementById('dataInicial').value = '';
        document.getElementById('dataFinal').value = '';
        this.loadData();
    }
};
