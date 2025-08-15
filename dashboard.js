// Dashboard Profissional (dashboard.js)
// ======================================

const DashboardModule = {
    timelineChartCreated: false,
    statusChartCreated: false,

    render(container) {
        container.innerHTML = `
            <div class="page dashboard-page active" id="dashboard">
                <!-- Header com controles -->
                <div class="dashboard-header">
                    <div class="dashboard-title">
                        <h1>💰 Dashboard Financeiro</h1>
                        <p class="dashboard-subtitle">Visão geral do seu negócio em tempo real</p>
                    </div>
                    <div class="dashboard-controls">
                        <div class="period-selector">
                            <button class="btn btn--sm period-btn active" data-period="7">7 dias</button>
                            <button class="btn btn--sm period-btn" data-period="30">30 dias</button>
                            <button class="btn btn--sm period-btn" data-period="90">90 dias</button>
                        </div>
                        <div class="zoom-controls">
                            <button class="btn btn--sm zoom-btn" id="zoomOut">🔍-</button>
                            <span class="zoom-level" id="zoomLevel">100%</span>
                            <button class="btn btn--sm zoom-btn" id="zoomIn">🔍+</button>
                            <button class="btn btn--sm zoom-btn" id="zoomReset">Reset</button>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-content" id="dashboardContent">
                    <!-- Métricas Principais -->
                    <div class="metrics-section">
                        <div class="metrics-grid">
                            <!-- Receitas -->
                            <div class="metric-card metric-card--success">
                                <div class="metric-header">
                                    <div class="metric-icon">
                                        <div class="icon-circle success">💰</div>
                                    </div>
                                    <div class="metric-trend">
                                        <span class="trend-value" id="trendReceber">+12%</span>
                                        <span class="trend-arrow">↗️</span>
                                    </div>
                                </div>
                                <div class="metric-content">
                                    <h3 class="metric-label">A Receber Este Mês</h3>
                                    <p class="metric-value" id="valorReceberMes">R$ 0,00</p>
                                    <small class="metric-description">Juros pendentes de cobrança</small>
                                </div>
                                <div class="metric-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: 75%"></div>
                                    </div>
                                    <span class="progress-label">75% da meta</span>
                                </div>
                            </div>

                            <!-- Recebido -->
                            <div class="metric-card metric-card--primary">
                                <div class="metric-header">
                                    <div class="metric-icon">
                                        <div class="icon-circle primary">✅</div>
                                    </div>
                                    <div class="metric-trend">
                                        <span class="trend-value" id="trendRecebido">+8%</span>
                                        <span class="trend-arrow">↗️</span>
                                    </div>
                                </div>
                                <div class="metric-content">
                                    <h3 class="metric-label">Recebido Este Mês</h3>
                                    <p class="metric-value" id="valorRecebidoMes">R$ 0,00</p>
                                    <small class="metric-description">Pagamentos confirmados</small>
                                </div>
                                <div class="metric-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill primary" style="width: 60%"></div>
                                    </div>
                                    <span class="progress-label">Meta: R$ 15.000</span>
                                </div>
                            </div>

                            <!-- Total Ano -->
                            <div class="metric-card metric-card--info">
                                <div class="metric-header">
                                    <div class="metric-icon">
                                        <div class="icon-circle info">📊</div>
                                    </div>
                                    <div class="metric-trend">
                                        <span class="trend-value" id="trendAno">+24%</span>
                                        <span class="trend-arrow">↗️</span>
                                    </div>
                                </div>
                                <div class="metric-content">
                                    <h3 class="metric-label">Total Este Ano</h3>
                                    <p class="metric-value" id="valorRecebidoAno">R$ 0,00</p>
                                    <small class="metric-description">Acumulado 2025</small>
                                </div>
                                <div class="metric-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill info" style="width: 45%"></div>
                                    </div>
                                    <span class="progress-label">45% da meta anual</span>
                                </div>
                            </div>

                            <!-- Clientes Ativos -->
                            <div class="metric-card metric-card--warning">
                                <div class="metric-header">
                                    <div class="metric-icon">
                                        <div class="icon-circle warning">👥</div>
                                    </div>
                                    <div class="metric-trend">
                                        <span class="trend-value" id="trendClientes">+3</span>
                                        <span class="trend-arrow">↗️</span>
                                    </div>
                                </div>
                                <div class="metric-content">
                                    <h3 class="metric-label">Clientes Ativos</h3>
                                    <p class="metric-value" id="clientesAtivos">0</p>
                                    <small class="metric-description">Com empréstimos vigentes</small>
                                </div>
                                <div class="metric-stats">
                                    <div class="stat-item">
                                        <span class="stat-label">Novos:</span>
                                        <span class="stat-value">+2</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Quitações:</span>
                                        <span class="stat-value">-1</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Perdas -->
                            <div class="metric-card metric-card--danger">
                                <div class="metric-header">
                                    <div class="metric-icon">
                                        <div class="icon-circle danger">⚠️</div>
                                    </div>
                                    <div class="metric-trend">
                                        <span class="trend-value" id="trendPerdas">-5%</span>
                                        <span class="trend-arrow">↘️</span>
                                    </div>
                                </div>
                                <div class="metric-content">
                                    <h3 class="metric-label">Perdas em Atraso</h3>
                                    <p class="metric-value" id="valorPerdas">R$ 0,00</p>
                                    <small class="metric-description">+90 dias sem pagamento</small>
                                </div>
                                <div class="metric-stats">
                                    <div class="stat-item">
                                        <span class="stat-label">Casos:</span>
                                        <span class="stat-value" id="casosPerda">0</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Taxa:</span>
                                        <span class="stat-value">2.1%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tabelas Compactas -->
                    <div class="tables-section">
                        <div class="table-container">
                            <h3>🏆 Top 5 Clientes por Juros</h3>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Cliente</th>
                                        <th>Valor</th>
                                    </tr>
                                </thead>
                                <tbody id="rankingTableBody">
                                    <tr><td colspan="3">Carregando...</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="table-container">
                            <h3>📅 Próximos Vencimentos</h3>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Valor</th>
                                        <th>Vence em</th>
                                    </tr>
                                </thead>
                                <tbody id="vencimentosTableBody">
                                    <tr><td colspan="3">Nenhum vencimento próximo</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Gráfico Simples -->
                    <div class="chart-section">
                        <h3>📈 Evolução dos Últimos 6 Meses</h3>
                        <div class="chart-container">
                            <canvas id="timelineChart" width="400" height="200"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    },

    loadData() {
        this.calculateMetrics();
        this.loadRanking();
        this.loadVencimentos();
        this.createTimelineChart();
    },

    calculateMetrics() {
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();

        const emprestimosPermitidos = sistema.getFilteredEmprestimos();
        const historicoPermitido = sistema.getFilteredHistorico();

        // Valor a receber este mês
        const valorReceberMes = emprestimosPermitidos
            .filter(e => e.status === 'ativo')
            .reduce((sum, e) => sum + Utils.calcularJuros(e.valorPrincipal, e.jurosPerc), 0);

        // Valor recebido este mês
        const valorRecebidoMes = historicoPermitido
            .filter(h => {
                const d = new Date(h.dataPagamento);
                return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
            })
            .reduce((sum, h) => sum + h.valorPago, 0);

        // Valor recebido este ano
        const valorRecebidoAno = historicoPermitido
            .filter(h => new Date(h.dataPagamento).getFullYear() === anoAtual)
            .reduce((sum, h) => sum + h.valorPago, 0);

        // Clientes ativos
        const clientesAtivos = new Set(
            emprestimosPermitidos.filter(e => e.status === 'ativo').map(e => e.clienteId)
        ).size;

        // Perdas em atraso
        const valorPerdas = this.calcularPerdas();

        // Atualizar UI
        document.getElementById('valorReceberMes').textContent = Utils.formatCurrency(valorReceberMes);
        document.getElementById('valorRecebidoMes').textContent = Utils.formatCurrency(valorRecebidoMes);
        document.getElementById('valorRecebidoAno').textContent = Utils.formatCurrency(valorRecebidoAno);
        document.getElementById('clientesAtivos').textContent = clientesAtivos;
        document.getElementById('valorPerdas').textContent = Utils.formatCurrency(valorPerdas);
    },

    calcularPerdas() {
        const hoje = new Date();
        const emprestimosPermitidos = sistema.getFilteredEmprestimos();
        let totalPerdas = 0;

        emprestimosPermitidos.forEach(emp => {
            if (emp.status === 'ativo') {
                const vencimento = new Date(emp.dataInicio);
                vencimento.setMonth(vencimento.getMonth() + 1);
                
                const diasAtraso = Math.floor((hoje - vencimento) / (1000 * 60 * 60 * 24));
                
                if (diasAtraso > 90) {
                    const juros = Utils.calcularJuros(emp.valorPrincipal, emp.jurosPerc);
                    const multa = Utils.calcularMulta(juros, diasAtraso);
                    totalPerdas += emp.valorPrincipal + juros + multa;
                }
            }
        });

        return totalPerdas;
    },

    loadRanking() {
        const rankMap = {};
        const historicoPermitido = sistema.getFilteredHistorico();
        
        historicoPermitido.forEach(h => {
            if (h.tipo === 'juros') {
                if (!rankMap[h.clienteId]) rankMap[h.clienteId] = 0;
                rankMap[h.clienteId] += h.valorPago;
            }
        });

        const ranking = Object.entries(rankMap)
            .map(([clienteId, valor]) => {
                const cliente = sistema.clientes.find(c => c.id === clienteId);
                return {
                    clienteId,
                    nome: cliente ? cliente.nome : clienteId,
                    foto: cliente ? cliente.foto : null,
                    valor
                };
            })
            .sort((a, b) => b.valor - a.valor)
            .slice(0, 5);

        const tbody = document.getElementById('rankingTableBody');
        if (ranking.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">Nenhum registro encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = ranking.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>
                    ${item.foto ? `<img src="${item.foto}" class="client-photo" alt="${item.nome}">` : ''}
                    ${item.nome}
                </td>
                <td>${Utils.formatCurrency(item.valor)}</td>
            </tr>
        `).join('');
    },

    loadVencimentos() {
        const hoje = new Date();
        const emprestimosPermitidos = sistema.getFilteredEmprestimos();
        
        const vencimentos = emprestimosPermitidos
            .filter(e => e.status === 'ativo')
            .map(e => {
                const cliente = sistema.clientes.find(c => c.id === e.clienteId);
                const vencimento = new Date(e.dataInicio);
                vencimento.setMonth(vencimento.getMonth() + 1);
                
                const diasParaVencer = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
                
                return {
                    ...e,
                    nome: cliente ? cliente.nome : e.clienteId,
                    foto: cliente ? cliente.foto : null,
                    diasParaVencer
                };
            })
            .filter(e => e.diasParaVencer > 0 && e.diasParaVencer <= 7)
            .sort((a, b) => a.diasParaVencer - b.diasParaVencer);

        const tbody = document.getElementById('vencimentosTableBody');
        if (vencimentos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">Nenhum vencimento próximo</td></tr>';
            return;
        }

        tbody.innerHTML = vencimentos.map(v => `
            <tr>
                <td>
                    ${v.foto ? `<img src="${v.foto}" class="client-photo" alt="${v.nome}">` : ''}
                    ${v.nome}
                </td>
                <td>${Utils.formatCurrency(v.valorPrincipal)}</td>
                <td>${v.diasParaVencer} dias</td>
            </tr>
        `).join('');
    },

    createTimelineChart() {
        const ctx = document.getElementById('timelineChart');
        if (!ctx || this.timelineChartCreated) return;

        if (window.timelineChartInstance) {
            window.timelineChartInstance.destroy();
        }

        try {
            const hoje = new Date();
            const meses = [];
            const recebidos = [];
            const perdas = [];

            for (let i = 5; i >= 0; i--) {
                const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
                const mesNome = data.toLocaleDateString('pt-BR', { month: 'short' });
                meses.push(mesNome);

                const historicoPermitido = sistema.getFilteredHistorico();
                
                const valorRecebido = historicoPermitido
                    .filter(h => {
                        const d = new Date(h.dataPagamento);
                        return d.getMonth() === data.getMonth() && d.getFullYear() === data.getFullYear();
                    })
                    .reduce((sum, h) => sum + h.valorPago, 0);

                recebidos.push(valorRecebido);
                const perdaEstimada = valorRecebido * 0.05;
                perdas.push(perdaEstimada);
            }

            window.timelineChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: meses,
                    datasets: [
                        {
                            label: 'Recebido',
                            data: recebidos,
                            borderColor: 'rgba(0, 179, 126, 1)',
                            backgroundColor: 'rgba(0, 179, 126, 0.1)',
                            borderWidth: 2,
                            tension: 0.3,
                            fill: false
                        },
                        {
                            label: 'Perdas',
                            data: perdas,
                            borderColor: 'rgba(247, 90, 104, 1)',
                            backgroundColor: 'rgba(247, 90, 104, 0.1)',
                            borderWidth: 2,
                            tension: 0.3,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: '#E1E1E6',
                                font: { size: 11 }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#E1E1E6',
                                font: { size: 10 },
                                callback: function(value) {
                                    return 'R$ ' + value.toLocaleString('pt-BR');
                                }
                            },
                            grid: {
                                color: '#29292E'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#E1E1E6',
                                font: { size: 10 }
                            },
                            grid: {
                                color: '#29292E'
                            }
                        }
                    }
                }
            });

            this.timelineChartCreated = true;

        } catch (error) {
            console.error('Erro ao criar gráfico:', error);
        }
    },

    setZoom(level) {
        sistema.zoomLevel = level;
        const dashboardContent = document.getElementById('dashboardContent');
        if (dashboardContent) {
            dashboardContent.style.transform = `scale(${level})`;
            document.getElementById('zoomLevel').textContent = `${Math.round(level * 100)}%`;
        }
    },

    bindEvents() {
        // Controles de zoom
        document.getElementById('zoomOut')?.addEventListener('click', () => {
            this.setZoom(Math.max(0.8, sistema.zoomLevel - 0.1));
        });

        document.getElementById('zoomIn')?.addEventListener('click', () => {
            this.setZoom(Math.min(1.2, sistema.zoomLevel + 0.1));
        });

        document.getElementById('zoomReset')?.addEventListener('click', () => {
            this.setZoom(1.0);
        });

        // Botões de período
        document.querySelectorAll('.period-btn')?.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.loadData(); // Recarregar dados para o período selecionado
            });
        });
    }
};