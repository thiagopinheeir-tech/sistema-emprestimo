const Utils = {
  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  },

  calcularJuros(valorPrincipal, jurosPerc) {
    if (!valorPrincipal || !jurosPerc) return 0;
    return parseFloat(valorPrincipal) * parseFloat(jurosPerc) / 100;
  },

  calcularVencimento(dataInicio) {
    if (!dataInicio) return '-';
    const data = new Date(dataInicio);
    data.setMonth(data.getMonth() + 1);
    return data.toLocaleDateString('pt-BR');
  },

  calcularAtraso(emprestimo) {
    const hoje = new Date();
    const vencimento = new Date(emprestimo.dataInicio);
    vencimento.setMonth(vencimento.getMonth() + 1);
    const diasAtraso = Math.floor((hoje - vencimento) / (1000 * 60 * 60 * 24));
    return Math.max(0, diasAtraso);
  },

  calcularMulta(valorJuros, diasAtraso) {
    if (diasAtraso <= 0) return 0;
    const percentualMulta = diasAtraso * 0.02;
    return valorJuros * percentualMulta;
  },

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

💰 Valores:
• Juros original: ${Utils.formatCurrency(valores.jurosOriginal)}
• Juros com multa: ${Utils.formatCurrency(valores.jurosComMulta)}
• Valor Total: ${Utils.formatCurrency(valores.valorTotal)}

${statusMensagem}

📱 Se tiver dúvidas, chama aqui! 👍

*Mensagem automática do Sistema de Empréstimos*`;
  },

  enviarCobrancaWhatsApp(emprestimoId) {
    const emprestimo = sistema.emprestimos.find(e => e.id === emprestimoId);
    if (!emprestimo || !sistema.canEditClient(emprestimo.clienteId)) {
      alert('Empréstimo não encontrado ou sem permissão.');
      return;
    }

    const cliente = sistema.clientes.find(c => c.id === emprestimo.clienteId);
    if (!cliente || !cliente.contato) {
      alert('Cliente não possui número de contato cadastrado.');
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
      alert('Número de WhatsApp inválido.');
      return;
    }

    const mensagemCodificada = encodeURIComponent(mensagem);
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`;

    try {
      window.open(urlWhatsApp, '_blank');
      setTimeout(() => {
        if (confirm('Cobrança enviada com sucesso! Deseja registrar a tentativa de cobrança?')) {
          console.log(`Cobrança enviada para ${cliente.nome} em ${new Date().toLocaleString()}`);
        }
      }, 1000);
    } catch (error) {
      alert('Erro ao abrir WhatsApp. Verifique se o aplicativo está instalado.');
    }
  },

  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  sortBy(array, property, ascending = true) {
    return array.sort((a, b) => {
      if (a[property] === b[property]) return 0;
      if (ascending) return a[property] > b[property] ? 1 : -1;
      else return a[property] < b[property] ? 1 : -1;
    });
  },

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
