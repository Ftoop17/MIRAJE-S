// Обработчик всплывающего окна расширения
document.addEventListener('DOMContentLoaded', function() {
  // Элементы интерфейса
  const takeScreenshotBtn = document.getElementById('takeScreenshot');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const stealthModeToggle = document.getElementById('stealthModeToggle');
  const screenshotType = document.getElementById('screenshotType');
  const copyWalletBtn = document.getElementById('copyWallet');
  const walletAddress = document.getElementById('walletAddress');
  
  // Загрузка сохраненных настроек
  chrome.storage.sync.get(['darkMode', 'stealthMode', 'screenshotType'], function(result) {
    darkModeToggle.checked = result.darkMode || false;
    stealthModeToggle.checked = result.stealthMode !== false;
    screenshotType.value = result.screenshotType || 'fullpage';
  });
  
  // Обработчик кнопки создания скриншота
  takeScreenshotBtn.addEventListener('click', function() {
    chrome.storage.sync.get(['stealthMode', 'screenshotType'], function(result) {
      chrome.runtime.sendMessage({
        action: 'takeScreenshot',
        options: {
          stealthMode: result.stealthMode !== false,
          type: result.screenshotType || 'fullpage'
        }
      }, function(response) {
        if (response && response.success) {
          showNotification('Скриншот успешно создан и сохранён!');
        } else {
          showNotification('Ошибка при создании скриншота: ' + (response.error || 'неизвестная ошибка'), true);
        }
      });
    });
  });
  
  // Обработчик переключения темной темы
  darkModeToggle.addEventListener('change', function() {
    const enabled = this.checked;
    chrome.storage.sync.set({ darkMode: enabled });
    
    chrome.runtime.sendMessage({
      action: 'toggleDarkMode',
      enable: enabled
    });
  });
  
  // Обработчик переключения скрытого режима
  stealthModeToggle.addEventListener('change', function() {
    chrome.storage.sync.set({ stealthMode: this.checked });
  });
  
  // Обработчик изменения типа скриншота
  screenshotType.addEventListener('change', function() {
    chrome.storage.sync.set({ screenshotType: this.value });
  });
  
  // Обработчик кнопки копирования кошелька
  copyWalletBtn.addEventListener('click', function() {
    navigator.clipboard.writeText(walletAddress.textContent.trim())
      .then(() => {
        showNotification('Адрес кошелька скопирован в буфер обмена!');
      })
      .catch(err => {
        showNotification('Не удалось скопировать адрес: ' + err, true);
      });
  });
  
  // Регистрация горячих клавиш
  document.addEventListener('keydown', function(e) {
    // Комбинация M+J (английские)
    if (e.key.toLowerCase() === 'j' && e.key.toLowerCase() === 'm') {
      takeScreenshotBtn.click();
    }
  });
  
  // Функция показа уведомления
  function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = 'notification ' + (isError ? 'error' : 'success');
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
      notification.classList.add('fade-out');
      setTimeout(function() {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
});

// Стили для уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  .notification {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: bold;
    z-index: 1000;
    opacity: 1;
    transition: opacity 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
  
  .success {
    background: linear-gradient(135deg, #4CAF50, #2E7D32);
    color: white;
  }
  
  .error {
    background: linear-gradient(135deg, #F44336, #C62828);
    color: white;
  }
  
  .fade-out {
    opacity: 0 !important;
  }
`;
document.head.appendChild(notificationStyles);