// Arquivo de inicialização do sistema
// ====================================

// Aguardar carregamento do DOM
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Sistema de Empréstimos inicializando...');
  
  // Verificar se todos os scripts necessários foram carregados
  if (typeof SistemaEmprestimos === 'undefined') {
    console.error('❌ Erro: app.js não carregado');
    return;
  }

  if (typeof Utils === 'undefined') {
    console.error('❌ Erro: utils.js não carregado');
    return;
  }

  // Verificar módulos
  const modulos = ['DashboardModule', 'ClientesModule', 'EmprestimosModule', 'HistoricoModule', 'UsuariosModule'];
  const modulosCarregados = modulos.filter(modulo => typeof window[modulo] !== 'undefined');
  
  if (modulosCarregados.length !== modulos.length) {
    console.warn('⚠️ Alguns módulos não foram carregados:', 
      modulos.filter(m => !modulosCarregados.includes(m))
    );
  }

  // Verificar Supabase
  if (typeof supabase === 'undefined') {
    console.error('❌ Erro: Supabase não carregado. Verifique a conexão com a internet.');
  }

  // Verificar configuração
  if (typeof SUPABASE_CONFIG === 'undefined' || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    console.error('❌ Erro: Configure o arquivo env.js com suas credenciais do Supabase');
    
    // Mostrar modal de configuração
    mostrarModalConfiguracao();
    return;
  }

  // Inicializar sistema
  try {
    window.sistema = new SistemaEmprestimos();
    console.log('✅ Sistema inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema:', error);
    mostrarErroInicializacao(error.message);
  }
});

// Função para mostrar modal de configuração
function mostrarModalConfiguracao() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    color: white;
    font-family: Arial, sans-serif;
  `;

  modal.innerHTML = `
    <div style="background: #1f1f23; padding: 2rem; border-radius: 12px; max-width: 500px; text-align: center;">
      <h2 style="color: #33bca7; margin-bottom: 1rem;">⚙️ Configuração Necessária</h2>
      <p>Para usar o sistema, você precisa configurar o Supabase:</p>
      <ol style="text-align: left; margin: 1rem 0;">
        <li>Crie uma conta em <a href="https://supabase.com" target="_blank" style="color: #33bca7;">supabase.com</a></li>
        <li>Crie um novo projeto</li>
        <li>Vá em Settings > API</li>
        <li>Copie a URL e a chave anon/public</li>
        <li>Edite o arquivo <code>env.js</code></li>
        <li>Execute o script <code>database-setup.sql</code> no SQL Editor</li>
      </ol>
      <p style="font-size: 0.9rem; color: #888;">Consulte o README.md para instruções detalhadas</p>
      <button onclick="window.location.reload()" style="
        background: #33bca7;
        color: #1f1f23;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        margin-top: 1rem;
      ">Recarregar Página</button>
    </div>
  `;

  document.body.appendChild(modal);
}

// Função para mostrar erro de inicialização
function mostrarErroInicializacao(mensagem) {
  const loginContainer = document.getElementById('loginContainer');
  if (loginContainer) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      background: #ff5459;
      color: white;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 6px;
      text-align: center;
    `;
    errorDiv.innerHTML = `
      <strong>❌ Erro de Inicialização</strong><br>
      ${mensagem}<br>
      <small>Verifique o console para mais detalhes (F12)</small>
    `;
    
    loginContainer.querySelector('.login-card').insertBefore(
      errorDiv, 
      loginContainer.querySelector('.login-header').nextSibling
    );
  }
}

// Configurar eventos globais de erro
window.addEventListener('error', function(e) {
  console.error('💥 Erro JavaScript:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('💥 Promise rejeitada:', e.reason);
});

console.log('📝 Sistema de Empréstimos v2.0 - Pronto para inicializar!');