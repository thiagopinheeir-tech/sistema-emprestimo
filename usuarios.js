// Módulo Usuários (Admin Only)
// =============================

const UsuariosModule = {
    editingUserId: null,

    // Renderizar HTML da página de usuários
    render(container) {
        if (sistema.currentUser.role !== 'admin') {
            container.innerHTML = `
                <div class="page usuarios-page active" id="usuarios">
                    <div class="page-header">
                        <h2>Acesso Negado</h2>
                    </div>
                    <p>Você não tem permissão para acessar esta página.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="page usuarios-page active" id="usuarios">
                <div class="page-header">
                    <h2>Gerenciar Usuários</h2>
                    <button class="btn btn--primary" id="novoUsuarioBtn">Novo Usuário</button>
                </div>

                <!-- Modal Novo/Editar Usuário -->
                <div class="modal hidden" id="usuarioModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="usuarioModalTitle">Novo Usuário</h3>
                            <button class="btn-close" id="closeUsuarioModalBtn">×</button>
                        </div>
                        <form class="modal-body" id="usuarioForm">
                            <div class="form-group">
                                <label class="form-label">Nome de Usuário *</label>
                                <input type="text" class="form-control" id="novoUsername" required>
                                <small class="text-muted">Nome único para login</small>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Senha *</label>
                                <input type="password" class="form-control" id="novoPassword" required>
                                <small class="text-muted">Mínimo 6 caracteres</small>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Confirmar Senha *</label>
                                <input type="password" class="form-control" id="confirmarPassword" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Nome Completo *</label>
                                <input type="text" class="form-control" id="novoNome" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Perfil de Acesso *</label>
                                <select class="form-control" id="novoRole" required>
                                    <option value="">Selecione um perfil</option>
                                    <option value="manager">Gerente</option>
                                    <option value="operator">Operador</option>
                                </select>
                                <small class="text-muted">Gerente: Acesso a seus operadores | Operador: Acesso a seus clientes</small>
                            </div>
                            <div class="form-group manager-field hidden">
                                <label class="form-label">Gerente Responsável</label>
                                <select class="form-control" id="novoGerente">
                                    <option value="">Nenhum (independente)</option>
                                </select>
                                <small class="text-muted">Apenas para operadores</small>
                            </div>
                        </form>
                        <div class="modal-footer">
                            <button type="submit" form="usuarioForm" class="btn btn--primary" id="saveUsuarioBtn">Criar Usuário</button>
                            <button type="button" class="btn btn--secondary" id="cancelUsuarioBtn">Cancelar</button>
                        </div>
                    </div>
                </div>

                <!-- Tabela de Usuários -->
                <div class="table-container">
                    <table class="table" id="usuariosTable">
                        <thead>
                            <tr>
                                <th>Usuário</th>
                                <th>Nome Completo</th>
                                <th>Perfil</th>
                                <th>Gerente</th>
                                <th>Status</th>
                                <th>Clientes</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="usuariosTableBody">
                            <tr><td colspan="7">Carregando usuários...</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- Estatísticas de Usuários -->
                <div class="metrics-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-top: 2rem;">
                    <div class="metric-card">
                        <div class="metric-icon">👥</div>
                        <div class="metric-info">
                            <h3>Total Usuários</h3>
                            <p class="metric-value" id="totalUsuarios">0</p>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-icon">👨‍💼</div>
                        <div class="metric-info">
                            <h3>Gerentes</h3>
                            <p class="metric-value" id="totalGerentes">0</p>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-icon">👷</div>
                        <div class="metric-info">
                            <h3>Operadores</h3>
                            <p class="metric-value" id="totalOperadores">0</p>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-icon">✅</div>
                        <div class="metric-info">
                            <h3>Usuários Ativos</h3>
                            <p class="metric-value" id="usuariosAtivos">0</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    },

    // Carregar dados
    loadData() {
        if (sistema.currentUser.role !== 'admin') return;
        
        this.loadUsuarios();
        this.populateGerenteSelect();
        this.calcularEstatisticas();
    },

    // Carregar lista de usuários
    loadUsuarios() {
        const tbody = document.getElementById('usuariosTableBody');
        
        tbody.innerHTML = sistema.users.map(user => {
            const gerente = user.gerenteId ? sistema.users.find(u => u.id === user.gerenteId) : null;
            const roleNames = {
                'admin': 'Administrador',
                'manager': 'Gerente',
                'operator': 'Operador'
            };

            // Contar clientes do usuário
            const clientesCount = sistema.clientes.filter(c => c.responsavelId === user.id).length;
            
            return `
                <tr>
                    <td><strong>${user.username}</strong></td>
                    <td>${user.name}</td>
                    <td><span class="status-badge status-ativo">${roleNames[user.role]}</span></td>
                    <td>${gerente ? gerente.name : '-'}</td>
                    <td><span class="status-badge status-${user.status === 'ativo' ? 'ativo' : 'inativo'}">${user.status}</span></td>
                    <td>${clientesCount}</td>
                    <td>
                        ${user.role !== 'admin' ? `
                            <button class="btn btn--sm btn--info" onclick="UsuariosModule.editUsuario('${user.id}')">
                                Editar
                            </button>
                            <button class="btn btn--sm btn--warning" onclick="UsuariosModule.toggleUserStatus('${user.id}')">
                                ${user.status === 'ativo' ? 'Desativar' : 'Ativar'}
                            </button>
                            <button class="btn btn--sm btn--danger" onclick="UsuariosModule.removerUsuario('${user.id}')">
                                Remover
                            </button>
                        ` : '<span class="text-muted">Protegido</span>'}
                    </td>
                </tr>
            `;
        }).join('');
    },

    // Popular select de gerente
    populateGerenteSelect() {
        const select = document.getElementById('novoGerente');
        if (!select) return;
        
        const gerentes = sistema.users.filter(u => u.role === 'manager' && u.status === 'ativo');
        select.innerHTML = '<option value="">Nenhum (independente)</option>' +
            gerentes.map(gerente => `
                <option value="${gerente.id}">${gerente.name}</option>
            `).join('');
    },

    // Calcular estatísticas
    calcularEstatisticas() {
        const totalUsuarios = sistema.users.length;
        const totalGerentes = sistema.users.filter(u => u.role === 'manager').length;
        const totalOperadores = sistema.users.filter(u => u.role === 'operator').length;
        const usuariosAtivos = sistema.users.filter(u => u.status === 'ativo').length;

        document.getElementById('totalUsuarios').textContent = totalUsuarios;
        document.getElementById('totalGerentes').textContent = totalGerentes;
        document.getElementById('totalOperadores').textContent = totalOperadores;
        document.getElementById('usuariosAtivos').textContent = usuariosAtivos;
    },

    // Abrir modal novo usuário
    openNewUserModal() {
        this.editingUserId = null;
        document.getElementById('usuarioModalTitle').textContent = 'Novo Usuário';
        document.getElementById('saveUsuarioBtn').textContent = 'Criar Usuário';
        Utils.clearForm('usuarioForm');
        document.querySelector('.manager-field').classList.remove('show');
        Utils.toggleModal('usuarioModal', true);
    },

    // Editar usuário
    editUsuario(userId) {
        const user = sistema.users.find(u => u.id === userId);
        if (!user || user.role === 'admin') {
            Utils.alert('Usuário não pode ser editado.');
            return;
        }
        
        this.editingUserId = userId;
        document.getElementById('usuarioModalTitle').textContent = 'Editar Usuário';
        document.getElementById('saveUsuarioBtn').textContent = 'Salvar Alterações';
        
        // Preencher formulário
        document.getElementById('novoUsername').value = user.username;
        document.getElementById('novoPassword').value = '';
        document.getElementById('confirmarPassword').value = '';
        document.getElementById('novoNome').value = user.name;
        document.getElementById('novoRole').value = user.role;
        document.getElementById('novoGerente').value = user.gerenteId || '';
        
        // Mostrar/esconder campo gerente
        if (user.role === 'operator') {
            document.querySelector('.manager-field').classList.add('show');
        } else {
            document.querySelector('.manager-field').classList.remove('show');
        }
        
        // Tornar senha não obrigatória na edição
        document.getElementById('novoPassword').required = false;
        document.getElementById('confirmarPassword').required = false;
        
        Utils.toggleModal('usuarioModal', true);
    },

    // Adicionar/editar usuário
    addUsuario(userData) {
        // Validar username único
        if (sistema.users.find(u => u.username === userData.username && u.id !== this.editingUserId)) {
            Utils.alert('Nome de usuário já existe.');
            return;
        }

        if (this.editingUserId) {
            // Editando usuário existente
            const user = sistema.users.find(u => u.id === this.editingUserId);
            if (user) {
                user.username = userData.username;
                user.name = userData.name;
                user.role = userData.role;
                user.gerenteId = userData.gerenteId || null;
                
                // Só atualiza senha se foi fornecida
                if (userData.password) {
                    user.password = userData.password;
                }
                
                Utils.alert('Usuário atualizado com sucesso!');
            }
        } else {
            // Criando novo usuário
            const newUser = {
                id: Utils.generateId('user_'),
                ...userData,
                gerenteId: userData.gerenteId || null,
                status: 'ativo'
            };
            sistema.users.push(newUser);
            Utils.alert('Usuário criado com sucesso!');
        }
        
        this.loadUsuarios();
        this.populateGerenteSelect();
        this.calcularEstatisticas();

        // Atualizar selects de responsável nos outros módulos
        if (typeof ClientesModule !== 'undefined' && ClientesModule.populateResponsavelSelect) {
            ClientesModule.populateResponsavelSelect();
        }
    },

    // Alterar status do usuário
    toggleUserStatus(userId) {
        const user = sistema.users.find(u => u.id === userId);
        if (!user || user.role === 'admin') return;
        
        const novoStatus = user.status === 'ativo' ? 'inativo' : 'ativo';
        const acao = novoStatus === 'ativo' ? 'ativar' : 'desativar';
        
        Utils.confirm(`Tem certeza que deseja ${acao} o usuário ${user.name}?`, () => {
            user.status = novoStatus;
            this.loadUsuarios();
            this.calcularEstatisticas();
            Utils.alert(`Usuário ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`);
        });
    },

    // Remover usuário
    removerUsuario(userId) {
        const user = sistema.users.find(u => u.id === userId);
        if (!user || user.role === 'admin') return;
        
        // Verificar se tem clientes
        const clientesCount = sistema.clientes.filter(c => c.responsavelId === userId).length;
        if (clientesCount > 0) {
            Utils.alert(`Não é possível remover este usuário pois ele é responsável por ${clientesCount} cliente(s). Transfira os clientes antes de remover.`);
            return;
        }
        
        Utils.confirm(`Tem certeza que deseja remover o usuário ${user.name}?`, () => {
            sistema.users = sistema.users.filter(u => u.id !== userId);
            this.loadUsuarios();
            this.populateGerenteSelect();
            this.calcularEstatisticas();
            Utils.alert('Usuário removido com sucesso!');

            // Atualizar selects de responsável nos outros módulos
            if (typeof ClientesModule !== 'undefined' && ClientesModule.populateResponsavelSelect) {
                ClientesModule.populateResponsavelSelect();
            }
        });
    },

    // Bind eventos
    bindEvents() {
        // Novo usuário
        document.getElementById('novoUsuarioBtn')?.addEventListener('click', () => {
            this.openNewUserModal();
        });

        // Fechar modal
        document.getElementById('closeUsuarioModalBtn')?.addEventListener('click', () => {
            Utils.toggleModal('usuarioModal', false);
            // Restaurar required nas senhas
            document.getElementById('novoPassword').required = true;
            document.getElementById('confirmarPassword').required = true;
        });

        // Cancelar modal
        document.getElementById('cancelUsuarioBtn')?.addEventListener('click', () => {
            Utils.toggleModal('usuarioModal', false);
            // Restaurar required nas senhas
            document.getElementById('novoPassword').required = true;
            document.getElementById('confirmarPassword').required = true;
        });

        // Mudança no tipo de usuário
        document.getElementById('novoRole')?.addEventListener('change', (e) => {
            const managerField = document.querySelector('.manager-field');
            if (e.target.value === 'operator') {
                managerField.classList.add('show');
            } else {
                managerField.classList.remove('show');
                document.getElementById('novoGerente').value = '';
            }
        });

        // Submit formulário
        document.getElementById('usuarioForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const password = document.getElementById('novoPassword').value;
            const confirmPassword = document.getElementById('confirmarPassword').value;
            
            // Validar senhas apenas se foram fornecidas (edição) ou sempre (novo)
            if (!this.editingUserId || password || confirmPassword) {
                if (password !== confirmPassword) {
                    Utils.alert('As senhas não coincidem.');
                    return;
                }
                if (password.length < 6) {
                    Utils.alert('A senha deve ter pelo menos 6 caracteres.');
                    return;
                }
            }
            
            const userData = {
                username: document.getElementById('novoUsername').value,
                password: password || undefined,
                name: document.getElementById('novoNome').value,
                role: document.getElementById('novoRole').value,
                gerenteId: document.getElementById('novoGerente').value
            };

            this.addUsuario(userData);
            
            // Fechar modal e limpar
            Utils.toggleModal('usuarioModal', false);
            Utils.clearForm('usuarioForm');
            document.querySelector('.manager-field').classList.remove('show');
            
            // Restaurar required nas senhas
            document.getElementById('novoPassword').required = true;
            document.getElementById('confirmarPassword').required = true;
        });
    }
};