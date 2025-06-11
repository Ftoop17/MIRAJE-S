// Фоновый скрипт для обработки команд и управления расширением
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ 
    darkMode: false,
    stealthMode: true,
    screenshotType: 'fullpage'
  });
});

// Обработчик команды для создания скриншота
chrome.commands.onCommand.addListener((command) => {
  if (command === 'take-screenshot') {
    takeScreenshot();
  }
});

// Обработчик сообщений от content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'takeScreenshot') {
    takeScreenshot(request.options).then(sendResponse);
    return true;
  }
  
  if (request.action === 'toggleDarkMode') {
    chrome.storage.sync.get(['darkMode'], (result) => {
      const newMode = !result.darkMode;
      chrome.storage.sync.set({ darkMode: newMode });
      
      // Применяем тему ко всем вкладкам
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.url && tab.url.startsWith('http')) {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['js/darkmode.js']
            });
          }
        });
      });
      
      sendResponse({ darkMode: newMode });
    });
    return true;
  }
});

// Функция создания скриншота
async function takeScreenshot(options = {}) {
  const { stealthMode, screenshotType } = await chrome.storage.sync.get([
    'stealthMode',
    'screenshotType'
  ]);
  
  const finalOptions = {
    ...options,
    stealthMode: stealthMode !== false,
    type: screenshotType || 'fullpage'
  };
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (finalOptions.stealthMode) {
      // В скрытом режиме используем chrome.tabs.captureVisibleTab
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
        format: 'png',
        quality: 100
      });
      
      await downloadScreenshot(dataUrl, tab.title || 'screenshot');
      return { success: true };
    } else {
      // В обычном режиме используем более сложный метод через content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'takeAdvancedScreenshot',
        options: finalOptions
      });
      
      if (response && response.success) {
        await downloadScreenshot(response.dataUrl, tab.title || 'screenshot');
        return { success: true };
      } else {
        throw new Error('Не удалось сделать скриншот');
      }
    }
  } catch (error) {
    console.error('Ошибка при создании скриншота:', error);
    return { success: false, error: error.message };
  }
}

// Функция загрузки скриншота
async function downloadScreenshot(dataUrl, filename) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const downloadFilename = `MIRAJE-S_${filename}_${timestamp}.png`;
  
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    await chrome.downloads.download({
      url: blobUrl,
      filename: downloadFilename,
      saveAs: true
    });
  } catch (error) {
    console.error('Ошибка при загрузке скриншота:', error);
  }
}