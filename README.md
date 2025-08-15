# Sistema de Empréstimos

Sistema web completo para gerenciamento de empréstimos, clientes e usuários com arquitetura modular, login hierárquico, dashboard financeiro, upload de foto local e integração com WhatsApp para cobranças.

## 🚀 Funcionalidades

### 🔐 **Autenticação e Permissões**
- Login seguro com 3 níveis: Administrador, Gerente e Operador
- Sistema hierárquico de permissões
- Controle de acesso por responsabilidade

### 👥 **Gestão de Clientes**
- Cadastro completo com foto (upload local/base64)
- Edição e remoção com controle de permissões
- Status ativo/inativo
- Campos: nome, contato, endereço, CPF, data nascimento, observações

### 💰 **Controle de Empréstimos**
- Criação de empréstimos com cálculo automático
- Pagamento mensal de juros
- Quitação com histórico completo
- Filtros por status (ativo/quitado/todos)

### 📊 **Dashboard Financeiro**
- Métricas principais: recebimentos, perdas, clientes ativos
- Ranking dos top 5 clientes por juros pagos
- Próximos vencimentos (7 dias)
- Gráfico evolutivo dos últimos 6 meses
- Controles de zoom para visualização

### 📈 **Histórico Detalhado**
- Registro completo de pagamentos e quitações
- Filtros por cliente, tipo, data
- Resumo por empréstimo
- Estatísticas gerais

### 📱 **Cobrança WhatsApp**
- Mensagem automática com cálculo de multa
- Integração direta com WhatsApp Web
- Cálculo automático de atraso e juros

### ⚙️ **Gestão de Usuários (Admin)**
- Criar gerentes e operadores
- Definir hierarquia (operador → gerente)
- Ativar/desativar usuários
- Estatísticas de usuários

## 📁 Estrutura do Projeto

```
sistema-emprestimos/
├── index.html          # Estrutura principal
├── style.css           # Estilos e responsividade
├── app.js              # Inicialização e controle geral
├── utils.js            # Funções utilitárias
├── dashboard.js        # Módulo Dashboard
├── clientes.js         # Módulo Clientes
├── emprestimos.js      # Módulo Empréstimos
├── historico.js        # Módulo Histórico
├── usuarios.js         # Módulo Usuários
└── README.md           # Este arquivo
```

## 💻 Como Usar

### **Instalação**
1. Baixe todos os arquivos para uma pasta
2. Abra `index.html` em navegador moderno
3. **Não precisa de servidor** - funciona localmente

### **Login Padrão**
- **Admin:** `admin` / `123456`
- **Gerente:** `gerente` / `123456`  
- **Operador:** `operador` / `123456`

### **Fluxo de Uso**
1. **Login** com credenciais apropriadas
2. **Cadastre clientes** com foto e dados completos
3. **Crie empréstimos** definindo valor e juros
4. **Gerencie pagamentos** mensais e quitações
5. **Envie cobranças** via WhatsApp automaticamente
6. **Monitore** métricas no dashboard
7. **Gerencie usuários** (apenas Admin)

## 🔧 Personalização

### **Dados Iniciais**
Edite `app.js` nas seções:
- `this.users` - Usuários padrão
- `this.clientes` - Clientes exemplo
- `this.emprestimos` - Empréstimos exemplo
- `this.historicoPagamentos` - Histórico exemplo

### **Aparência**
Modifique `style.css`:
- Variáveis CSS no `:root` para cores
- Classes responsivas para mobile
- Tema escuro personalizado

### **Funcionalidades**
- Cada módulo (`dashboard.js`, `clientes.js`, etc.) é independente
- Funções utilitárias em `utils.js`
- Fácil extensão e manutenção

## 🏗️ Arquitetura Modular

### **Vantagens**
✅ **Manutenção:** Cada funcionalidade em arquivo separado  
✅ **Escalabilidade:** Fácil adicionar novos módulos  
✅ **Debuging:** Problemas isolados por funcionalidade  
✅ **Colaboração:** Múltiplos desenvolvedores podem trabalhar simultaneamente  
✅ **Responsividade:** Menu lateral (desktop) + navegação inferior (mobile)  

### **Módulos**
- **app.js:** Controle central, autenticação, navegação
- **dashboard.js:** Métricas, gráficos, ranking
- **clientes.js:** CRUD completo de clientes
- **emprestimos.js:** Gestão de empréstimos e pagamentos
- **historico.js:** Relatórios e histórico
- **usuarios.js:** Administração de usuários
- **utils.js:** Funções compartilhadas

## 📱 Responsividade

### **Desktop (>768px)**
- Sidebar fixa com navegação
- Dashboard com zoom
- Modais centralizados

### **Mobile (≤768px)**
- Sidebar retrátil
- Navegação inferior fixa
- Interface otimizada para toque

## 🛡️ Permissões

### **Administrador**
- Acesso total ao sistema
- Gerencia usuários
- Vê todos os clientes e empréstimos

### **Gerente**
- Acessa seus operadores
- Vê clientes dos operadores subordinados
- Dashboard filtrado

### **Operador**
- Acessa apenas seus clientes
- Funcionalidades básicas
- Interface simplificada

## 🔧 Requisitos Técnicos

### **Navegador**
- Chrome, Firefox, Edge, Safari (modernas)
- JavaScript ES6+ habilitado
- LocalStorage disponível

### **Dependências**
- **Chart.js** (CDN) - Para gráficos
- **Nenhuma instalação** local necessária

### **WhatsApp**
- Funciona via WhatsApp Web
- Requer WhatsApp instalado no dispositivo

## 📝 Notas de Desenvolvimento

### **Dados Persistentes**
⚠️ Os dados são armazenados apenas na memória (variáveis JavaScript). Para persistência real, implemente:
- LocalStorage para dados locais
- API backend para dados servidor
- Banco de dados para produção

### **Segurança**
⚠️ Sistema atual é demonstrativo. Para produção:
- Criptografia de senhas
- Autenticação JWT
- Validação servidor-side
- HTTPS obrigatório

### **Extensões Futuras**
- Backup/restore de dados
- Relatórios em PDF
- Notificações por email
- API REST para integração
- App mobile nativo

## 📞 Suporte

- **Bugs:** Verifique console do navegador (F12)
- **Customização:** Edite arquivos conforme documentado
- **Dúvidas:** Consulte comentários no código

## 📄 Licença

Uso livre para fins educacionais e comerciais. Sem garantias.

---

**Sistema desenvolvido com arquitetura modular para facilitar manutenção e escalabilidade.**