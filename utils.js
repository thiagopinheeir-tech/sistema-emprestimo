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
Valores:
- Juros original: ${Utils.formatCurrency(valores.jurosOriginal)}
- Juros com multa: ${Utils.formatCurrency(valores.jurosComMulta)}
- Valor Total: ${Utils.formatCurrency(valores.valorTotal)}
${statusMensagem}
Se tiver dúvidas, chama aqui! 👍`;
    },

    // Enviar cobrança via WhatsApp
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
            noPhotoText.style.display = 'none';
            
            previewImg.onerror = () => {
                previewImg.style.display = 'none';
                noPhotoText.style.display = 'block';
                noPhotoText.textContent = 'Erro ao carregar imagem';
            };
        } else {
            previewImg.style.display = 'none';
            noPhotoText.style.display = 'block';
            noPhotoText.textContent = 'Nenhuma foto selecionada';
        }
    },

    // Gerar ID único
    generateId(prefix = '') {
        return prefix + Date.now().toString();
    },

    // Limpar formulário
    clearForm(formId) {
        document.getElementById(formId).reset();
    },

    // Mostrar/esconder modal
    toggleModal(modalId, show = true) {
        const modal = document.getElementById(modalId);
        if (show) {
            modal.classList.remove('hidden');
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

    // Mostrar alerta
    alert(message, type = 'info') {
        // Para implementação futura de toasts/notificações
        window.alert(message);
    },

    // Validar CPF (básico)
    validarCPF(cpf) {
        if (!cpf) return true; // Campo opcional
        const cpfLimpo = cpf.replace(/\D/g, '');
        return cpfLimpo.length === 11;
    },

    // Validar telefone (básico)
    validarTelefone(telefone) {
        if (!telefone) return true; // Campo opcional
        const telefoneLimpo = telefone.replace(/\D/g, '');
        return telefoneLimpo.length >= 10;
    },

    // Formatar data para input
    formatDateForInput(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
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
            if (ascending) {
                return a[property] > b[property] ? 1 : -1;
            } else {
                return a[property] < b[property] ? 1 : -1;
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
    }
};