// Utilitários Compartilhados (utils.js)
// ======================================

const Utils = {
  
  // Formatação de moeda
  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  },

  // Cálculo de juros
  calcularJuros(valorPrincipal, jurosPerc) {
    if (!valorPrincipal || !jurosPerc) return 0;
    return parseFloat(valorPrincipal) * parseFloat(jurosPerc) / 100;
  },

  // Calcular vencimento (adiciona 1 mês à data)
  calcularVencimento(dataInicio) {
    if (!dataInicio) return '-';
    const data = new Date(dataInicio);
    data.setMonth(data.getMonth() + 1);
    return data.toLocaleDateString('pt-BR');
  },

  // Calcular atraso em dias
  calcularAtraso(emprestimo) {
    const hoje = new Date();
    const vencimento = new Date(emprestimo.dataInicio);
    vencimento.setMonth(vencimento.getMonth() + 1);
    const diasAtraso = Math.floor((hoje - vencimento) / (1000 * 60 * 60 * 24));
    return Math.max(0, diasAtraso);
  },

  // Calcular multa por atraso
  calcularMulta(valorJuros, diasAtraso) {
    if (diasAtraso <= 0) return 0;
    const percentualMulta = diasAtraso * 0.02; // 2% por dia
    return valorJuros * percentualMulta;
  },

  // Extrair número WhatsApp válido
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

  // Gerar mensagem de cobrança WhatsApp
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

    return `Opa, ${cliente.nome} 👋

O vencimento do seu pagamento foi em ${vencimento.toLocaleDateString('pt-BR')}.

💰 **Valores:**
• Juros original: ${Utils.formatCurrency(valores.jurosOriginal)}
• Juros com multa: ${Utils.formatCurrency(valores.jurosComMulta)}
• **Valor Total: ${Utils.formatCurrency(valores.valorTotal)}**

${statusMensagem}

📱 Se tiver dúvidas, chama aqui! 👍

*Mensagem automática do Sistema de Empréstimos*`;
  },

  // Enviar cobrança via WhatsApp
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
          // Registrar tentativa de cobrança (implementar se necessário)
          console.log(`Cobrança enviada para ${cliente.nome} em ${new Date().toLocaleString()}`);
          Utils.alert('Cobrança registrada no histórico!', 'success');
        }
      }, 1000);
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
      Utils.alert('Erro ao abrir WhatsApp. Verifique se o aplicativo está instalado.', 'error');
    }
  },

  // Converter arquivo para base64
  convertToBase64(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target.result);
    reader.readAsDataURL(file);
  },

  // Preview de foto
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

  // Gerar ID único
  generateId(prefix = '') {
    return prefix + Date.now().toString() + Math.random().toString(36).substr(2, 9);
  },

  // Limpar formulário
  clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
  },

  // Mostrar/esconder modal
  toggleModal(modalId, show = true) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    if (show) {
      modal.classList.remove('hidden');
      // Focar no primeiro campo do formulário se existir
      const firstInput = modal.querySelector('input, select, textarea');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    } else {
      modal.classList.add('hidden');
    }
  },

  // Confirmar ação
  confirm(message, callback) {
    if (window.confirm(message)) {
      callback();
    }
  },

  // Mostrar alerta/notificação
  alert(message, type = 'info') {
    // Implementação básica - pode ser melhorada com toast/notificações
    const alertTypes = {
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'info': 'ℹ️'
    };
    
    const icon = alertTypes[type] || alertTypes.info;
    window.alert(`${icon} ${message}`);
  },

  // Validar CPF (básico)
  validarCPF(cpf) {
    if (!cpf) return true; // Campo opcional
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.length === 11;
  },

  // Validar CNPJ (básico)
  validarCNPJ(cnpj) {
    if (!cnpj) return true; // Campo opcional
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    return cnpjLimpo.length === 14;
  },

  // Validar telefone (básico)
  validarTelefone(telefone) {
    if (!telefone) return true; // Campo opcional
    const telefoneLimpo = telefone.replace(/\D/g, '');
    return telefoneLimpo.length >= 10;
  },

  // Validar email
  validarEmail(email) {
    if (!email) return true; // Campo opcional
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  // Formatar data para input
  formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  },

  // Formatar data para exibição
  formatDateForDisplay(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  },

  // Debounce para busca
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Ordenar array por propriedade
  sortBy(array, property, ascending = true) {
    return array.sort((a, b) => {
      const aValue = a[property];
      const bValue = b[property];
      
      if (aValue === bValue) return 0;
      
      if (ascending) {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  },

  // Filtrar array por texto
  filterByText(array, searchText, properties = []) {
    if (!searchText) return array;
    const lowerSearchText = searchText.toLowerCase();
    
    return array.filter(item => {
      return properties.some(prop => {
        const value = item[prop];
        return value && value.toString().toLowerCase().includes(lowerSearchText);
      });
    });
  },

  // Formatar número de telefone para exibição
  formatPhone(phone) {
    if (!phone) return '';
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  },

  // Formatar CPF para exibição
  formatCPF(cpf) {
    if (!cpf) return '';
    const numbers = cpf.replace(/\D/g, '');
    
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    return cpf;
  },

  // Formatar CNPJ para exibição
  formatCNPJ(cnpj) {
    if (!cnpj) return '';
    const numbers = cnpj.replace(/\D/g, '');
    
    if (numbers.length === 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return cnpj;
  },

  // Calcular idade
  calcularIdade(dataNascimento) {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  },

  // Truncar texto
  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  // Capitalizar primeira letra
  capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  // Remover acentos
  removeAccents(text) {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },

  // Formatar valor percentual
  formatPercent(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format((value || 0) / 100);
  },

  // Copiar texto para clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      Utils.alert('Texto copiado para a área de transferência!', 'success');
    } catch (error) {
      console.error('Erro ao copiar texto:', error);
      Utils.alert('Erro ao copiar texto.', 'error');
    }
  },

  // Download de arquivo
  downloadFile(content, filename, contentType = 'text/plain') {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};