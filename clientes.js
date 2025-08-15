// Módulo Clientes - Versão Firebase
// ==================================

const ClientesModule = {
    editingClienteId: null,

    render(container) {
        container.innerHTML = `
            <div class="page">
                <!-- Cabeçalho da página -->
                <div class="page-header">
                    <h2>👥 Cadastro de Clientes</h2>
                    <div class="page-controls">
                        <button class="btn btn--primary" onclick="ClientesModule.showClienteModal()">
                            + Novo Cliente
                        </button>
                        <button class="btn btn--secondary" onclick="sistema.recarregarDados()">
                            🔄 Recarregar
                        </button>
                    </div>
                </div>

                <!-- Formulário de cadastro -->
                <div class="form-container" id="clienteFormContainer">
                    <form id="clienteForm" class="form">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="clienteNome">Nome Completo *</label>
                                <input type="text" id="clienteNome" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="clienteContato">Telefone/WhatsApp</label>
                                <input type="text" id="clienteContato" class="form-control" placeholder="(11) 99999-9999">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="clienteEndereco">Endereço</label>
                                <input type="text" id="clienteEndereco" class="form-control">
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="clienteDocumento">CPF/RG</label>
                                <input type="text" id="clienteDocumento" class="form-control">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="clienteNascimento">Data de Nascimento</label>
                                <input type="date" id="clienteNascimento" class="form-control">
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="clienteStatus">Status</label>
                                <select id="clienteStatus" class="form-control">
                                    <option value="ativo">Ativo</option>
                                    <option value="inativo">Inativo</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="clienteObservacoes">Observações</label>
                            <textarea id="clienteObservacoes" class="form-control" rows="3"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn--secondary" onclick="ClientesModule.cancelarEdicao()">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn--primary" id="clienteSubmitBtn">
                                💾 Salvar Cliente
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Lista de clientes -->
                <div class="table-container">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3>📋 Lista de Clientes</h3>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" id="searchClientes" class="form-control" placeholder="🔍 Buscar clientes..." style="width: 200px;">
                        </div>
                    </div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Contato</th>
                                <th>Status</th>
                                <th>Cadastrado</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="clientesTableBody">
                            <tr><td colspan="5">Carregando clientes...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.bindEvents();
    },

    loadData() {
        console.log('📂 Carregando dados de clientes...');
        this.renderClientesTable();
    },

    renderClientesTable() {
        const tbody = document.getElementById('clientesTableBody');
        const clientes = sistema.getFilteredClientes();

        if (clientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhum cliente cadastrado</td></tr>';
            return;
        }

        tbody.innerHTML = clientes.map(cliente => `
            <tr>
                <td>
                    <strong>${cliente.nome}</strong>
                    ${cliente.documento ? `<br><small>${cliente.documento}</small>` : ''}
                </td>
                <td>
                    ${cliente.contato ? `
                        <a href="https://wa.me/${Utils.extrairNumeroWhatsApp(cliente.contato)}" target="_blank" title="Abrir WhatsApp">
                            📱 ${cliente.contato}
                        </a>
                    ` : 'Não informado'}
                </td>
                <td>
                    <span class="status-badge status-${cliente.status}">
                        ${cliente.status === 'ativo' ? '✅ Ativo' : '❌ Inativo'}
                    </span>
                </td>
                <td>
                    ${cliente.criadoEm ? new Date(cliente.criadoEm.seconds * 1000).toLocaleDateString('pt-BR') : 'N/A'}
                </td>
                <td>
                    <button class="btn btn--sm btn--secondary" onclick="ClientesModule.editarCliente('${cliente.id}')" title="Editar">
                        ✏️
                    </button>
                    ${sistema.canEditClient(cliente.id) ? `
                        <button class="btn btn--sm btn--danger" onclick="ClientesModule.confirmarDelete('${cliente.id}')" title="Excluir">
                            🗑️
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    },

    async salvarCliente(dadosCliente) {
        const submitBtn = document.getElementById('clienteSubmitBtn');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '⏳ Salvando...';
            submitBtn.disabled = true;

            let sucesso = false;
            
            if (this.editingClienteId) {
                // Atualizar cliente existente
                sucesso = await sistema.atualizarCliente(this.editingClienteId, dadosCliente);
            } else {
                // Adicionar responsável atual
                dadosCliente.responsavelId = sistema.currentUser.id;
                
                // Criar novo cliente
                sucesso = await sistema.adicionarCliente(dadosCliente);
            }

            if (sucesso) {
                document.getElementById('clienteForm').reset();
                this.editingClienteId = null;
                this.renderClientesTable();
                
                // Esconder formulário em telas menores
                if (window.innerWidth <= 768) {
                    document.getElementById('clienteFormContainer').classList.add('hidden');
                }
            }

        } catch (error) {
            console.error('❌ Erro ao salvar cliente:', error);
            FirebaseManager.mostrarNotificacao('Erro inesperado ao salvar cliente', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    },

    editarCliente(id) {
        const cliente = sistema.clientes.find(c => c.id === id);
        if (!cliente) return;

        // Preencher formulário
        document.getElementById('clienteNome').value = cliente.nome || '';
        document.getElementById('clienteContato').value = cliente.contato || '';
        document.getElementById('clienteEndereco').value = cliente.endereco || '';
        document.getElementById('clienteDocumento').value = cliente.documento || '';
        document.getElementById('clienteNascimento').value = cliente.dataNascimento || '';
        document.getElementById('clienteStatus').value = cliente.status || 'ativo';
        document.getElementById('clienteObservacoes').value = cliente.observacoes || '';

        this.editingClienteId = id;
        document.getElementById('clienteSubmitBtn').innerHTML = '💾 Atualizar Cliente';

        // Mostrar formulário em telas menores
        document.getElementById('clienteFormContainer').classList.remove('hidden');
        document.getElementById('clienteNome').focus();
    },

    cancelarEdicao() {
        document.getElementById('clienteForm').reset();
        this.editingClienteId = null;
        document.getElementById('clienteSubmitBtn').innerHTML = '💾 Salvar Cliente';
        
        // Esconder formulário em telas menores
        if (window.innerWidth <= 768) {
            document.getElementById('clienteFormContainer').classList.add('hidden');
        }
    },

    async confirmarDelete(id) {
        const cliente = sistema.clientes.find(c => c.id === id);
        if (!cliente) return;

        const confirmacao = confirm(`Tem certeza que deseja excluir o cliente "${cliente.nome}"?\n\nEsta ação não pode ser desfeita.`);
        if (!confirmacao) return;

        const sucesso = await sistema.deletarCliente(id);
        if (sucesso) {
            this.renderClientesTable();
        }
    },

    showClienteModal() {
        // Para telas menores, mostrar formulário
        if (window.innerWidth <= 768) {
            document.getElementById('clienteFormContainer').classList.remove('hidden');
            document.getElementById('clienteNome').focus();
        }
    },

    bindEvents() {
        // Submit do formulário
        document.getElementById('clienteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const dadosCliente = {
                nome: document.getElementById('clienteNome').value.trim(),
                contato: document.getElementById('clienteContato').value.trim(),
                endereco: document.getElementById('clienteEndereco').value.trim(),
                documento: document.getElementById('clienteDocumento').value.trim(),
                dataNascimento: document.getElementById('clienteNascimento').value,
                status: document.getElementById('clienteStatus').value,
                observacoes: document.getElementById('clienteObservacoes').value.trim()
            };

            // Validação básica
            if (!dadosCliente.nome) {
                alert('Nome é obrigatório!');
                return;
            }

            this.salvarCliente(dadosCliente);
        });

        // Busca em tempo real
        document.getElementById('searchClientes')?.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#clientesTableBody tr');
            
            rows.forEach(row => {
                const texto = row.textContent.toLowerCase();
                row.style.display = texto.includes(termo) ? '' : 'none';
            });
        });
    }
};