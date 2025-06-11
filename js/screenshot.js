// Расширенные функции для создания скриншотов
class ScreenshotManager {
  constructor() {
    this.originalStyles = new Map();
  }
  
  // Захват всей страницы
  async captureFullPage() {
    const body = document.body;
    const html = document.documentElement;
    
    const width = Math.max(
      body.scrollWidth, body.offsetWidth,
      html.clientWidth, html.scrollWidth, html.offsetWidth
    );
    
    const height = Math.max(
      body.scrollHeight, body.offsetHeight,
      html.clientHeight, html.scrollHeight, html.offsetHeight
    );
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    await this.disableProtection();
    
    try {
      if (typeof html2canvas !== 'undefined') {
        return await html2canvas(document.documentElement, {
          width: width,
          height: height,
          scale: 1,
          logging: false,
          useCORS: true,
          allowTaint: true,
          onclone: (clonedDoc) => {
            this.fixElementsForScreenshot(clonedDoc);
          }
        });
      } else {
        await this.loadAllImages();
        ctx.drawWindow(window, 0, 0, width, height, 'white');
        return canvas;
      }
    } finally {
      await this.restoreProtection();
    }
  }
  
  // Захват видимой области
  async captureVisibleArea() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    await this.disableProtection();
    
    try {
      if (typeof html2canvas !== 'undefined') {
        return await html2canvas(document.body, {
          width: width,
          height: height,
          windowWidth: width,
          windowHeight: height,
          scale: 1,
          logging: false,
          useCORS: true,
          allowTaint: true,
          onclone: (clonedDoc) => {
            this.fixElementsForScreenshot(clonedDoc);
          }
        });
      } else {
        await this.loadAllImages();
        ctx.drawWindow(window, 0, 0, width, height, 'white');
        return canvas;
      }
    } finally {
      await this.restoreProtection();
    }
  }
  
  // Отключение защиты от скриншотов
  async disableProtection() {
    // Сохраняем оригинальные стили
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      if (el.style.userSelect || el.style.webkitUserSelect || el.style.pointerEvents) {
        this.originalStyles.set(el, {
          userSelect: el.style.userSelect,
          webkitUserSelect: el.style.webkitUserSelect,
          pointerEvents: el.style.pointerEvents
        });
        
        el.style.userSelect = 'auto';
        el.style.webkitUserSelect = 'auto';
        el.style.pointerEvents = 'auto';
      }
    });
    
    // Удаляем обработчики событий
    document.removeEventListener('copy', this.preventDefault);
    document.removeEventListener('cut', this.preventDefault);
    document.removeEventListener('paste', this.preventDefault);
    document.removeEventListener('contextmenu', this.preventDefault);
    
    // Удаляем стили, блокирующие скриншоты
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach(style => {
      if (style.textContent.includes('user-select') || 
          style.textContent.includes('pointer-events')) {
        this.originalStyles.set(style, style.textContent);
        style.remove();
      }
    });
  }
  
  // Восстановление защиты
  async restoreProtection() {
    // Восстанавливаем оригинальные стили
    this.originalStyles.forEach((styles, el) => {
      if (el.style) {
        el.style.userSelect = styles.userSelect || '';
        el.style.webkitUserSelect = styles.webkitUserSelect || '';
        el.style.pointerEvents = styles.pointerEvents || '';
      } else if (el.textContent !== undefined) {
        el.textContent = styles;
        document.head.appendChild(el);
      }
    });
    
    this.originalStyles.clear();
  }
  
  // Загрузка всех изображений
  async loadAllImages() {
    const images = document.querySelectorAll('img, svg, canvas, video');
    const promises = [];
    
    images.forEach(img => {
      if (img.complete && img.naturalWidth !== 0) {
        return;
      }
      
      promises.push(new Promise(resolve => {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve);
      }));
    });
    
    await Promise.all(promises);
  }
  
  // Фикс элементов для скриншота
  fixElementsForScreenshot(clonedDoc) {
    // Удаляем элементы, которые могут мешать
    const noPrintElements = clonedDoc.querySelectorAll('.no-print, .no-screenshot, [data-no-screenshot]');
    noPrintElements.forEach(el => el.remove());
    
    // Фиксим iframe
    const iframes = clonedDoc.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        iframe.style.visibility = 'visible';
        iframe.style.opacity = '1';
      } catch (e) {
        iframe.remove();
      }
    });
    
    // Фиксим видео элементы
    const videos = clonedDoc.querySelectorAll('video');
    videos.forEach(video => {
      video.pause();
      video.currentTime = 0;
      video.poster = '';
      video.style.visibility = 'visible';
      video.style.opacity = '1';
    });
    
    // Фиксим canvas элементы
    const canvases = clonedDoc.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      canvas.style.visibility = 'visible';
      canvas.style.opacity = '1';
    });
  }
  
  preventDefault(e) {
    e.preventDefault();
    return false;
  }
}