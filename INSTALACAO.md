# 🚀 Instalação Rápida - Sistema de Empréstimos

## ⚡ Setup em 5 Minutos

### 1. Supabase (2 min)
```bash
# 1. Acesse: https://supabase.com
# 2. Criar conta → Novo projeto
# 3. Settings → API → Copiar URL e anon key
```

### 2. Configuração (1 min)
Edite `env.js`:
```javascript
const SUPABASE_CONFIG = {
  url: 'https://xxxxx.supabase.co',
  anonKey: 'eyJhbGc...'
};
```

### 3. Banco de Dados (2 min)
```sql
-- No Supabase SQL Editor, execute:
-- Cole todo o conteúdo do arquivo database-setup.sql
```

### 4. Testar ⚡
```bash
# Abra index.html no navegador
# Login: admin / 123456
```

---

## 📁 Arquivos Necessários

✅ **Principais:**
- `index.html` - Interface principal
- `style.css` - Design system completo  
- `app.js` - Sistema principal
- `env.js` - Configuração Supabase

✅ **Módulos:**
- `utils.js` - Funções utilitárias
- `dashboard.js` - Dashboard e métricas
- `clientes.js` - Gestão de clientes
- `emprestimos.js` - Controle de empréstimos
- `usuarios.js` - Administração de usuários
- `historico.js` - Histórico de pagamentos

✅ **Setup:**
- `database-setup.sql` - Script do banco
- `README.md` - Documentação completa

---

## 🔧 Estrutura de Pastas
```
sistema-emprestimos/
│
├── 📄 index.html
├── 🎨 style.css  
├── ⚙️ env.js
├── 🧠 app.js
├── 🛠️ utils.js
├── 📊 dashboard.js
├── 👥 clientes.js
├── 💰 emprestimos.js
├── 📈 historico.js
├── ⚙️ usuarios.js
├── 🗃️ database-setup.sql
└── 📖 README.md
```

---

## 🎯 Funcionalidades Principais

- ✅ **Login Hierárquico** (Admin/Gerente/Operador)
- ✅ **CRUD Completo** (Clientes, Empréstimos, Usuários)
- ✅ **Dashboard Interativo** com gráficos
- ✅ **WhatsApp Integration** para cobranças
- ✅ **Upload de Fotos** (base64)
- ✅ **Histórico Completo** de pagamentos
- ✅ **Responsive Design** (Mobile/Desktop)
- ✅ **Export CSV** de relatórios

---

## 🌟 Logins Padrão

| Usuário    | Senha   | Permissões                    |
|------------|---------|-------------------------------|
| `admin`    | `123456` | Acesso total ao sistema      |
| `gerente`  | `123456` | Gerencia operadores           |
| `operador` | `123456` | Acessa apenas seus clientes   |

---

## 🚨 Troubleshooting

### ❌ "Supabase não configurado"
➡️ Verifique `env.js` com URL e key corretas

### ❌ "Login não funciona"  
➡️ Execute `database-setup.sql` no Supabase

### ❌ "Layout quebrado"
➡️ Limpe cache do navegador (Ctrl+F5)

---

## 📱 WhatsApp

**Formato da mensagem automática:**
```
Opa, [Nome] 👋

Vencimento: [Data]
💰 Valor Total: R$ [XXX,XX]
🔴 [X] dias em atraso

📱 Dúvidas? Chama aqui! 👍
```

---

## 🔄 Próximos Passos

1. **Testar todas funcionalidades**
2. **Cadastrar clientes reais**
3. **Personalizar cores no CSS**
4. **Configurar domínio próprio**
5. **Fazer backup regular do banco**

---

**🎉 Sistema pronto para uso em produção!**

*Desenvolvido com Vanilla JS + Supabase + Design System próprio*