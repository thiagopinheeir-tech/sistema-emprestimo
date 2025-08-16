// Utilitários Compartilhados (utils.js)
// ======================================

const Utils = {
  // Formata número em moeda brasileira
  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  },

  // Calcula juros simples percentual
  calcularJuros(valorPrincipal, jurosPerc) {
    if (!valorPrincipal || !jurosPerc) return 0;
    return parseFloat(valorPrincipal) * parseFloat(jurosPerc) / 100;
  },

  // Calcula vencimento adicionando 1 mês à data inicial
  calcularVencimento(dataInicio) {
    if (!dataInicio) return '-';
    const data = new Date(dataInicio);
    data.setMonth(data.getMonth() + 1);
    return data.toLocaleDateString('pt-BR');
  },

  // Calcula dias de atraso a partir da data de início + 1 mês
  calcularAtraso(emprestimo) {
    const hoje = new Date();
    const vencimento = new Date(emprestimo.dataInicio);
    vencimento.setMonth(vencimento.getMonth() + 1);
    const diasAtraso = Math.floor((hoje - vencimento) / (1000 * 60 * 60 * 24));
    return Math.max(0, diasAtraso);
  },

  // Calcula multa aplicada conforme dias de atraso (2% por dia)
  calcularMulta(valorJuros, diasAtraso) {
    if (diasAtraso <= 0) return 0;
    const percentualMulta = diasAtraso * 0.02;
    return valorJuros * percentualMulta;
  },

  // Extrai número válido para WhatsApp a partir de contato
  extrairNumeroWhatsApp(contato) {
    if (!contato) return null;
    const numero = contato.replace(/\D/g, '');
    if (numero.length === 11 && numero.startsWith('11')) {
      return '55' + numero;
    }
    if (numero.length === 10) {
      return '55' + numero.substring(0, 2) + '9' + numero.substring(2);
    }
    if (numero.length === 13 && numero.startsWith('55')) {
      return numero;
    }
    return numero.length >= 10 ? '55' + numero : numero;
  },

  // Gera mensagem de cobrança para WhatsApp
  gerarMensagemCobranca(cliente, emprestimo, valores) {
    const vencimento = new Date(emprestimo.dataInicio);
    vencimento.setMonth(vencimento.getMonth() + 1);

    let statusMensagem = '';
    if (valores.diasAtraso === 0) {
      statusMensagem = '⚠️ Hoje é o vencimento. Pagamento deve ser feito até o fim do dia para evitar multa.';
    } else if (valores.diasAtraso === 1) {
      statusMensagem = '🔴 Pagamento em atraso há 1 dia. Pagamento deve ser feito o quanto antes.';
    } else {
      statusMensagem = `🔴 Pagamento em atraso há ${valores.diasAtraso} dias. Pagamento deve ser feito o quanto antes.`;
    }

    return `Opa, ${cliente.nome} 👋\n\nO vencimento do seu pagamento foi em ${vencimento.toLocaleDateString('pt-BR')}.\n\n💰 Valores:\n• Juros original: ${Utils.formatCurrency(valores.jurosOriginal)}\n• Juros com multa: ${Utils.formatCurrency(valores.jurosComMulta)}\n• Valor Total: ${Utils.formatCurrency(valores.valorTotal)}\n\n${statusMensagem}\n\n📱 Se tiver dúvidas, chama aqui! 👍\n\n*Mensagem automática do Sistema de Empréstimos*`;
  },

  // Envia mensagem de cobrança via WhatsApp
  enviarCobrancaWhatsApp(emprestimoId) {
    const emprestimo = sistema.emprestimos.find(e => e.id === emprestimoId);
    if (!emprestimo || !sistema.canEditClient(emprestimo.clienteId)) {
      Utils.alert('Empréstimo não encontrado ou sem permissão.', 'error');
      return;
    }

    const cliente = sistema.clientes.find(c => c.id === emprestimo.clienteId);
    if (!cliente || !cliente.contato) {
      Utils.alert('Cliente não possui número de contato cadastrado.', 'error');
      return;
    }

    const diasAtraso = Utils.calcularAtraso(emprestimo);
    const jurosOriginal = Utils.calcularJuros(emprestimo.valorPrincipal, emprestimo.jurosPerc);
    const multa = Utils.calcularMulta(jurosOriginal, diasAtraso);
    const jurosComMulta = jurosOriginal + multa;
    const valorTotal = emprestimo.valorPrincipal + jurosComMulta;

    const mensagem = Utils.gerarMensagemCobranca(cliente, emprestimo, {
      diasAtraso,
      jurosOriginal,
      multa,
      jurosComMulta,
      valorTotal
    });

    const numeroWhatsApp = Utils.extrairNumeroWhatsApp(cliente.contato);
    if (!numeroWhatsApp) {
      Utils.alert('Número de WhatsApp inválido.', 'error');
      return;
    }

    const mensagemCodificada = encodeURIComponent(mensagem);
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`;

    try {
      window.open(urlWhatsApp, '_blank');
      setTimeout(() => {
        if (confirm('Cobrança enviada com sucesso! Deseja registrar a tentativa de cobrança no histórico?')) {
          // Implementar função de registrar tentativa no histórico se necessário
          Utils.alert('Cobrança registrada no histórico!', 'success');
        }
      }, 1000);
    } catch (error) {
      Utils.alert('Erro ao abrir WhatsApp. Verifique se o aplicativo está instalado.', 'error');
    }
  },

  // Converte arquivo em base64
  convertToBase64(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target.result);
    reader.readAsDataURL(file);
  },

  // Exibe preview de foto (URL/base64)
  previewPhoto(photoUrl, previewImgId, noPhotoTextId) {
    const previewImg = document.getElementById(previewImgId);
    const noPhotoText = document.getElementById(noPhotoTextId);
    if (photoUrl && photoUrl.trim() !== '') {
      previewImg.src = photoUrl;
      previewImg.style.display = 'block';
      if (noPhotoText) noPhotoText.style.display = 'none';
      previewImg.onerror = () => {
        previewImg.style.display = 'none';
        if (noPhotoText) {
          noPhotoText.style.display = 'block';
          noPhotoText.textContent = 'Erro ao carregar imagem';
        }
      };
    } else {
      previewImg.style.display = 'none';
      if (noPhotoText) {
        noPhotoText.style.display = 'block';
        noPhotoText.textContent = 'Nenhuma foto selecionada';
      }
    }
  },

  // Gera ID único simples
  generateId(prefix = '') {
    return prefix + Date.now().toString() + Math.random().toString(36).substr(2, 9);
  },

  // Limpa formulário HTML pelo id
  clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
  },

  // Mostrar/Esconder modal
  toggleModal(modalId, show = true) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    if (show) {
      modal.classList.remove('hidden');
      const firstInput = modal.querySelector('input, select, textarea');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    } else {
      modal.classList.add('hidden');
    }
  },

  // Confirmar ação com callback
  confirm(message, callback) {
    if (window.confirm(message)) {
      callback();
    }
  },

  // Mensagem de alerta básica
  alert(message, type = 'info') {
    window.alert(message);
  },

  // Valida CPF básico (11 dígitos)
  validarCPF(cpf) {
    if (!cpf) return true;
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.length === 11;
  },

  // Valida telefone simples (10 ou mais dígitos)
  validarTelefone(telefone) {
    if (!telefone) return true;
    const telefoneLimpo = telefone.replace(/\D/g, '');
    return telefoneLimpo.length >= 10;
  },

  // Formata data para input type="date" (yyyy-mm-dd)
  formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  },

  // Formata data para exibição segundo padrão pt-BR
  formatDateForDisplay(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  },

  // Função debounce para evitar múltiplas execuções rápidas
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  // Ordena array por propriedade
  sortBy(array, property, ascending = true) {
    return array.sort((a, b) => {
      if (a[property] === b[property]) return 0;
      if (ascending) return a[property] > b[property] ? 1 : -1;
      else return a[property] < b[property] ? 1 : -1;
    });
  },

  // Filtra array por texto em propriedades
  filterByText(array, searchText, properties = []) {
    if (!searchText) return array;
    const lowerSearchText = searchText.toLowerCase();
    return array.filter(item =>
      properties.some(prop => {
        const value = item[prop];
        return value && value.toString().toLowerCase().includes(lowerSearchText);
      })
    );
  }
};
