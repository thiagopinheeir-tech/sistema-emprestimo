<<<<<<< HEAD
# Sistema de Empréstimos - Versão Supabase

Sistema web completo para gerenciamento de empréstimos, clientes e usuários com arquitetura modular, login hierárquico, dashboard financeiro, upload de foto local e integração com WhatsApp para cobranças, **agora com banco de dados Supabase**.

## 🚀 Novidades desta Versão

- ✅ **Integração completa com Supabase**
- ✅ **Persistência real de dados**
- ✅ **Design system profissional dark/light**
- ✅ **Autenticação segura com banco de dados**
- ✅ **Upload e armazenamento de fotos em base64**
- ✅ **Responsividade aprimorada**

## 📋 Pré-requisitos

### 1. Conta no Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie uma conta gratuita
- Crie um novo projeto

### 2. Navegador Moderno
- Chrome, Firefox, Edge ou Safari (versões recentes)
- JavaScript habilitado

## ⚙️ Configuração

### Passo 1: Configurar o Supabase

1. **Acesse seu projeto Supabase**
2. **Vá em `Settings` > `API`**
3. **Copie:**
   - `Project URL`
   - `anon/public key`

### Passo 2: Configurar o Sistema

1. **Baixe todos os arquivos do sistema**
2. **Edite o arquivo `env.js`:**
   ```javascript
   const SUPABASE_CONFIG = {
     url: 'https://SEU_PROJECT_ID.supabase.co',
     anonKey: 'SUA_CHAVE_ANONIMA_AQUI'
   };
   ```

### Passo 3: Criar as Tabelas

1. **No Supabase, vá em `SQL Editor`**
2. **Cole e execute o conteúdo do arquivo `database-setup.sql`**
3. **Aguarde a execução completar**

### Passo 4: Testar o Sistema

1. **Abra o arquivo `index.html` no navegador**
2. **Faça login com uma das contas:**
   - **Admin:** `admin` / `123456`
   - **Gerente:** `gerente` / `123456`
   - **Operador:** `operador` / `123456`

## 📁 Estrutura de Arquivos

```
sistema-emprestimos/
├── index.html              # Interface principal
├── style.css               # Design system completo
├── env.js                  # Configuração do Supabase
├── app.js                  # Sistema principal
├── utils.js                # Funções utilitárias
├── clientes.js             # Módulo de clientes
├── emprestimos.js          # Módulo de empréstimos
├── usuarios.js             # Módulo de usuários (admin)
├── dashboard.js            # Dashboard e métricas
├── historico.js            # Histórico de pagamentos
├── database-setup.sql      # Script do banco de dados
└── README.md              # Este arquivo
```

## 🔑 Funcionalidades

### 🔐 **Sistema de Autenticação**
- Login seguro com banco de dados
- 3 níveis de usuário: Admin, Gerente, Operador
- Controle hierárquico de permissões

### 👥 **Gestão de Clientes**
- Cadastro completo com foto (base64)
- Campos: nome, contato, documento, endereço, observações
- Edição com controle de permissões
- Status ativo/inativo

### 💰 **Controle de Empréstimos**
- Criação com cálculo automático de juros
- Registro de pagamentos mensais
- Quitação com histórico completo
- Filtros por status

### 📊 **Dashboard Inteligente**
- Métricas em tempo real
- Gráficos interativos (Chart.js)
- Top 5 clientes por juros pagos
- Próximos vencimentos (7 dias)
- Controles de zoom

### 📈 **Histórico Completo**
- Todos os pagamentos registrados
- Filtros por cliente, tipo, data
- Exportação para CSV
- Estatísticas detalhadas

### 📱 **Integração WhatsApp**
- Mensagens automáticas de cobrança
- Cálculo de multa por atraso
- Integração com WhatsApp Web

### ⚙️ **Administração de Usuários**
- Criação de gerentes e operadores
- Definição de hierarquias
- Controle de status (ativo/inativo)

## 🎨 Design System

### **Tema Automático**
- Dark/Light baseado na preferência do sistema
- Cores consistentes e acessibilidade

### **Componentes Reutilizáveis**
- Cards, botões, formulários padronizados
- Tabelas responsivas com hover
- Modais centralizados

### **Responsividade**
- **Desktop:** Sidebar fixa
- **Mobile:** Sidebar retrátil + bottom navigation
- Breakpoints otimizados

## 🛡️ Permissões e Segurança

### **Administrador**
- Acesso total ao sistema
- Gerencia todos os usuários
- Visualiza todos os clientes e empréstimos

### **Gerente**
- Gerencia operadores subordinados
- Visualiza clientes dos operadores
- Dashboard filtrado por hierarquia

### **Operador**
- Acessa apenas seus próprios clientes
- Funcionalidades básicas de CRUD
- Interface simplificada

## 🔧 Personalização

### **Cores e Tema**
Edite as variáveis CSS em `style.css`:
```css
:root {
  --color-primary: #33bca7;
  --color-surface: #1f1f23;
  --color-text: #e8edef;
  /* ... */
}
```

### **Dados Iniciais**
Os usuários padrão são criados pelo script SQL. Para adicionar mais dados iniciais, edite `database-setup.sql`.

### **Funcionalidades**
Cada módulo JS é independente, permitindo fácil personalização e extensão.

## 📱 WhatsApp

### **Como Funciona**
1. Cliente com atraso é identificado
2. Sistema calcula multa automaticamente
3. Gera mensagem personalizada
4. Abre WhatsApp Web com mensagem pronta

### **Formato da Mensagem**
```
Opa, [Nome do Cliente] 👋

O vencimento do seu pagamento foi em [Data].

💰 Valores:
• Juros original: R$ [Valor]
• Juros com multa: R$ [Valor com Multa]
• Valor Total: R$ [Total]

🔴 Pagamento em atraso há [X] dias.

📱 Se tiver dúvidas, chama aqui! 👍
```

## 🐛 Troubleshooting

### **Erro: "Supabase não configurado"**
- Verifique se o arquivo `env.js` está configurado corretamente
- Confirme se as chaves estão corretas

### **Erro: "Login não funciona"**
- Execute o script `database-setup.sql` no Supabase
- Verifique se as tabelas foram criadas

### **Erro: "Não consigo cadastrar cliente"**
- Verifique as permissões no Supabase
- Confirme se as políticas de segurança estão configuradas

### **Layout quebrado**
- Limpe o cache do navegador
- Verifique se o arquivo `style.css` está carregando

### **Gráficos não aparecem**
- Confirme se Chart.js está carregando (conexão com internet)
- Verifique o console do navegador para erros

## 🔄 Atualizações Futuras

### **Planejadas**
- [ ] Sistema de notificações push
- [ ] Relatórios em PDF
- [ ] App mobile (React Native)
- [ ] API REST documentada
- [ ] Sistema de backup automático
- [ ] Integração com bancos (PIX)

### **Possíveis Melhorias**
- [ ] Autenticação 2FA
- [ ] Logs de auditoria
- [ ] Tema customizável via interface
- [ ] Importação de dados via CSV
- [ ] Dashboard configurável

## 📞 Suporte

### **Problemas Técnicos**
1. Abra o Console do navegador (F12)
2. Verifique erros JavaScript
3. Confirme se o Supabase está respondendo

### **Configuração**
- Siga exatamente os passos deste README
- Mantenha as chaves do Supabase seguras
- Não commit o arquivo `env.js` com chaves reais

### **Desenvolvimento**
- Cada módulo pode ser editado independentemente
- Use o console para debug: `console.log(sistema.clientes)`
- Testes podem ser feitos com dados mock

## 📄 Licença

Sistema de uso livre para fins educacionais e comerciais. 

**Desenvolvido com:**
- Vanilla JavaScript (ES6+)
- Supabase (Backend as a Service)
- Chart.js (Gráficos)
- Design System próprio

---

**✨ Sistema pronto para produção com arquitetura moderna e escalável!**

Para dúvidas técnicas ou sugestões, verifique os logs do navegador e a documentação do Supabase.
=======
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
>>>>>>> 3d9d87908cfcf02c68054e3ac557608d4a425c20
