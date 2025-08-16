// Arquivo de inicialização do sistema
// ====================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Sistema de Empréstimos inicializando...');

  // Verifica se os scripts principais foram carregados
  if (typeof SistemaEmprestimos === 'undefined') {
    console.error('❌ Erro: app.js não carregado');
    return;
  }
  if (typeof Utils === 'undefined') {
    console.error('❌ Erro: utils.js não carregado');
    return;
  }

  // Verifica se os módulos estão carregados
  const modulos = ['DashboardModule', 'ClientesModule', 'EmprestimosModule', 'HistoricoModule', 'UsuariosModule'];
  const modulosCarregados = modulos.filter(modulo => typeof window[modulo] !== 'undefined');
  if (modulosCarregados.length !== modulos.length) {
    console.warn('⚠️ Alguns módulos não foram carregados:', modulos.filter(m => !modulosCarregados.includes(m)));
  }

  // Verifica se a biblioteca Supabase está carregada
  if (typeof supabase === 'undefined') {
    console.error('❌ Erro: Supabase não carregado. Verifique a conexão com a internet.');
    return;
  }

  // Verifica configuração do Supabase
  if (typeof SUPABASE_CONFIG === 'undefined' || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    console.error('❌ Erro: Configure o arquivo env.js com suas credenciais do Supabase');
    mostrarModalConfiguracao();
    return;
  }

  // Inicializar sistema de empréstimos
  try {
    window.sistema = new SistemaEmprestimos();
    console.log('✅ Sistema inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema:', error);
    mostrarErroInicializacao(error.message);
  }
});

// Modal caso falta configuração do Supabase
function mostrarModalConfiguracao() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex; align-items: center; justify-content: center;
    z-index: 10000; color: white; font-family: Arial, sans-serif;
  `;
  modal.innerHTML = `
    <div style="background: #232832; padding: 2rem; border-radius: 12px; max-width: 500px; text-align: center;">
      <h2 style="color: #33bca7; margin-bottom: 1rem;">⚙️ Configuração Necessária</h2>
      <p>Para usar o sistema, você precisa configurar o Supabase no arquivo <code>env.js</code>.</p>
      <ol style="text-align: left; margin: 1rem 0; color: #e8edef;">
        <li>Crie uma conta no <strong>Supabase</strong> em <a href="https://supabase.com" target="_blank" style="color: #33bca7;">supabase.com</a></li>
        <li>Crie um novo projeto</li>
        <li>Vá em <strong>Settings ↠ API</strong> e copie a URL e a chave <strong>anon/public</strong></li>
        <li>Preencha <code>SUPABASE_CONFIG</code> no arquivo <code>env.js</code></li>
        <li>Execute o script <code>database-setup.sql</code> no SQL Editor</li>
      </ol>
      <p style="font-size: 0.9rem; color: #8ad;">Consulte o <strong>README.md</strong> para instruções detalhadas.</p>
      <button onclick="window.location.reload()"
        style="
          background: #33bca7; color: #232832; border: none; padding: 0.8rem 1.5rem; border-radius: 6px;
          cursor: pointer; font-weight: 600; margin-top: 1rem;"
      >Recarregar Página</button>
    </div>
  `;
  document.body.appendChild(modal);
}

// Modal de erro caso falha ao inicializar sistema
function mostrarErroInicializacao(mensagem) {
  const loginContainer = document.getElementById('loginContainer');
  if (loginContainer) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      background: #ff5459; color: white; padding: 1rem;
      margin: 1rem 0; border-radius: 6px; text-align: center;
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
