// Utilitários do Sistema de Empréstimos
class Utils {
  
  // Formatar moeda brasileira
  static formatCurrency(value) {
    if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Formatar data brasileira
  static formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  }

  // Formatar data e hora
  static formatDateTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('pt-BR');
  }

  // Calcular diferença em dias
  static daysDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const timeDiff = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  // Gerar ID único
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Validar CPF
  static validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  }

  // Formatar CPF
  static formatCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  // Formatar telefone
  static formatPhone(phone) {
    phone = phone.replace(/[^\d]/g, '');
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  }

  // Capitalizar primeira letra
  static capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Capitalizar nome próprio
  static capitalizeName(name) {
    if (!name) return '';
    return name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  // Remover acentos
  static removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // Validar email
  static validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Calcular juros simples
  static calculateSimpleInterest(principal, rate, time) {
    return principal * (rate / 100) * time;
  }

  // Calcular juros compostos
  static calculateCompoundInterest(principal, rate, time) {
    return principal * Math.pow(1 + (rate / 100), time) - principal;
  }

  // Debounce para otimizar pesquisas
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Criar modal genérico
  static createModal(title, content, buttons = []) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--space-24);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    `;

    const modalHeader = document.createElement('h2');
    modalHeader.textContent = title;
    modalHeader.style.marginBottom = 'var(--space-16)';

    const modalBody = document.createElement('div');
    modalBody.innerHTML = content;
    modalBody.style.marginBottom = 'var(--space-16)';

    const modalFooter = document.createElement('div');
    modalFooter.style.cssText = `
      display: flex;
      gap: var(--space-8);
      justify-content: flex-end;
    `;

    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.textContent = btn.text;
      button.className = `btn ${btn.class || 'btn--secondary'}`;
      button.onclick = () => {
        if (btn.onClick) btn.onClick();
        document.body.removeChild(modal);
      };
      modalFooter.appendChild(button);
    });

    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    modal.appendChild(modalContent);

    // Fechar ao clicar fora
    modal.onclick = (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    };

    document.body.appendChild(modal);
    return modal;
  }

  // Mostrar toast/notificação
  static showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = `toast toast--${type}`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: var(--space-12) var(--space-16);
      border-radius: var(--radius-base);
      color: white;
      font-weight: var(--font-weight-medium);
      z-index: 2000;
      transform: translateX(100%);
      transition: transform var(--duration-normal) var(--ease-standard);
    `;

    // Cores por tipo
    const colors = {
      success: 'var(--color-success)',
      error: 'var(--color-error)',
      warning: 'var(--color-warning)',
      info: 'var(--color-info)'
    };
    
    toast.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(toast);

    // Animação de entrada
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);

    // Remover após duração
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  // Confirmar ação
  static confirm(message, onConfirm, onCancel) {
    return this.createModal(
      'Confirmação',
      `<p>${message}</p>`,
      [
        {
          text: 'Cancelar',
          class: 'btn--secondary',
          onClick: onCancel
        },
        {
          text: 'Confirmar',
          class: 'btn--primary',
          onClick: onConfirm
        }
      ]
    );
  }

  // Exportar dados para CSV
  static exportToCSV(data, filename = 'dados.csv') {
    if (!data || data.length === 0) {
      this.showToast('Nenhum dado para exportar', 'warning');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escapar aspas e adicionar aspas se contém vírgula
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.showToast('Arquivo exportado com sucesso!', 'success');
  }

  // Converter imagem para base64
  static imageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Redimensionar imagem
  static resizeImage(file, maxWidth = 300, maxHeight = 300, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para base64
        const resizedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(resizedBase64);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // Sanitizar string para HTML
  static sanitizeHtml(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  // Storage local helpers
  static setLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }

  static getLocalStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Erro ao ler do localStorage:', e);
      return defaultValue;
    }
  }

  static removeLocalStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Erro ao remover do localStorage:', e);
    }
  }
}

// Tornar disponível globalmente
window.Utils = Utils;

console.log('✅ Utils carregado com sucesso!');