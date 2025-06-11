// Улучшенная защита от копирования и выделения текста
document.addEventListener('DOMContentLoaded', function() {
    // Полная блокировка контекстного меню
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showWarning('Копирование материалов с этого расширения запрещено!');
        return false;
    });
    
    // Блокировка выделения текста
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Блокировка drag & drop для всех элементов
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Расширенная блокировка горячих клавиш
    document.addEventListener('keydown', function(e) {
        // Ctrl+C, Ctrl+A, Ctrl+X, Ctrl+V, Ctrl+Insert, Shift+Insert
        if ((e.ctrlKey || e.metaKey) && 
            (e.keyCode === 67 || e.keyCode === 65 || e.keyCode === 86 || 
             e.keyCode === 88 || e.keyCode === 45 || e.keyCode === 82)) {
            e.preventDefault();
            showWarning('Использование горячих клавиш для копирования запрещено!');
            return false;
        }
        
        // Блокировка Print Screen
        if (e.keyCode === 44 || (e.shiftKey && e.keyCode === 44)) {
            e.preventDefault();
            showWarning('Создание скриншотов страницы запрещено!');
            return false;
        }
        
        // Блокировка F12 и DevTools
        if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74))) {
            e.preventDefault();
            showWarning('Доступ к инструментам разработчика запрещен!');
            return false;
        }
    });
    
    // Защита от инспектирования элементов
    document.addEventListener('keydown', function(e) {
        if (e.keyCode === 123) { // F12
            e.preventDefault();
            return false;
        }
    });
    
    // Функция показа предупреждения
    function showWarning(message) {
        const warning = document.createElement('div');
        warning.style.position = 'fixed';
        warning.style.top = '0';
        warning.style.left = '0';
        warning.style.width = '100%';
        warning.style.padding = '15px';
        warning.style.background = '#ff0000';
        warning.style.color = '#ffffff';
        warning.style.textAlign = 'center';
        warning.style.fontWeight = 'bold';
        warning.style.zIndex = '999999';
        warning.textContent = message;
        
        document.body.appendChild(warning);
        
        setTimeout(function() {
            document.body.removeChild(warning);
        }, 3000);
    }
    
    // Дополнительная защита через CSS
    const style = document.createElement('style');
    style.textContent = `
        * {
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
        }
        
        img, svg, video, iframe {
            pointer-events: none !important;
            -webkit-touch-callout: none !important;
        }
        
        body {
            -webkit-user-drag: none !important;
        }
        
        /* Защита от выделения через CSS */
        ::selection {
            background: transparent !important;
            color: inherit !important;
        }
        ::-moz-selection {
            background: transparent !important;
            color: inherit !important;
        }
    `;
    document.head.appendChild(style);
    
    // Защита от открытия DevTools через меню браузера
    setInterval(function() {
        if (window.outerWidth - window.innerWidth > 100 || 
            window.outerHeight - window.innerHeight > 100) {
            window.close();
            window.location.href = 'about:blank';
        }
    }, 1000);
    
    // Защита от копирования через буфер обмена
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        showWarning('Копирование текста запрещено!');
        return false;
    });
    
    // Защита от вставки (на случай если пользователь попытается что-то вставить)
    document.addEventListener('paste', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Защита от вырезания
    document.addEventListener('cut', function(e) {
        e.preventDefault();
        return false;
    });
});

// Дополнительная защита при загрузке страницы
window.onload = function() {
    // Блокировка кнопки назад
    history.pushState(null, null, document.URL);
    window.addEventListener('popstate', function() {
        history.pushState(null, null, document.URL);
    });
    
    // Защита от iframe
    if (window != top) {
        top.location.href = window.location.href;
    }
};