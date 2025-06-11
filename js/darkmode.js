// Скрипт для управления темной темой
class DarkModeManager {
  constructor() {
    this.styleId = 'miraje-dark-mode';
    this.darkMode = false;
    this.init();
  }
  
  init() {
    chrome.storage.sync.get(['darkMode'], (result) => {
      if (result.darkMode) {
        this.enable();
      }
    });
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggleDarkMode') {
        if (request.enable) {
          this.enable();
        } else {
          this.disable();
        }
        sendResponse({ success: true });
      }
    });
  }
  
  enable() {
    if (this.darkMode) return;
    
    const style = document.createElement('style');
    style.id = this.styleId;
    style.textContent = this.getDarkModeCSS();
    document.head.appendChild(style);
    
    this.fixSpecificElements();
    this.darkMode = true;
  }
  
  disable() {
    if (!this.darkMode) return;
    
    const style = document.getElementById(this.styleId);
    if (style) style.remove();
    
    this.darkMode = false;
  }
  
  getDarkModeCSS() {
    return `
      :root {
        --dark-bg: #121212;
        --dark-text: #e0e0e0;
        --dark-link: #bb86fc;
        --dark-border: #333;
        --dark-input: #333;
        --dark-card: #1e1e1e;
      }
      
      body, div, section, article, main, header, footer {
        background-color: var(--dark-bg) !important;
        color: var(--dark-text) !important;
        border-color: var(--dark-border) !important;
      }
      
      h1, h2, h3, h4, h5, h6, p, span, a, li, td, th, label, caption {
        color: var(--dark-text) !important;
      }
      
      a, a:visited, a:active, a:hover {
        color: var(--dark-link) !important;
      }
      
      input, textarea, select, button {
        background-color: var(--dark-input) !important;
        color: var(--dark-text) !important;
        border-color: var(--dark-border) !important;
      }
      
      button, .btn, .button {
        background-color: var(--dark-input) !important;
        color: var(--dark-text) !important;
        border-color: var(--dark-border) !important;
      }
      
      .modal-content, .card, .panel, .dropdown-menu, .popup, .dialog {
        background-color: var(--dark-card) !important;
        border-color: var(--dark-border) !important;
      }
      
      table, tr, td, th {
        background-color: var(--dark-bg) !important;
        border-color: var(--dark-border) !important;
      }
      
      /* Инвертируем изображения для лучшей видимости */
      img, svg {
        filter: brightness(0.8) contrast(1.2) !important;
      }
      
      /* Фикс для YouTube */
      ytd-app[dark] {
        --yt-spec-general-background-a: var(--dark-bg) !important;
        --yt-spec-general-background-b: var(--dark-card) !important;
        --yt-spec-text-primary: var(--dark-text) !important;
      }
      
      /* Фикс для Twitter */
      html[data-theme="dark"], html[data-theme="dark"] body {
        background-color: var(--dark-bg) !important;
        color: var(--dark-text) !important;
      }
      
      /* Фикс для Facebook */
      [data-pagelet="root"] {
        background-color: var(--dark-bg) !important;
        color: var(--dark-text) !important;
      }
    `;
  }
  
  fixSpecificElements() {
    // Фикс для элементов, которые не обрабатываются CSS
    const elements = document.querySelectorAll('[style*="background-color"], [style*="color"]');
    elements.forEach(el => {
      const bgColor = el.style.backgroundColor;
      const textColor = el.style.color;
      
      if (bgColor && !bgColor.match(/transparent|rgba?\(0,\s*0,\s*0,\s*0\)|hsla?\(0,\s*0%,\s*0%,\s*0\)/i)) {
        el.dataset.originalBg = bgColor;
        el.style.backgroundColor = '#121212';
      }
      
      if (textColor && !textColor.match(/transparent|rgba?\(0,\s*0,\s*0,\s*0\)|hsla?\(0,\s*0%,\s*0%,\s*0\)/i)) {
        el.dataset.originalColor = textColor;
        el.style.color = '#e0e0e0';
      }
    });
  }
}

// Инициализация менеджера темной темы
new DarkModeManager();