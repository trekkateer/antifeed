// Initialize the settings if they don't exist
chrome.storage.sync.get(['settings'], async (result) => {
  if (!result.settings) {
    try {
      const response = await fetch(chrome.runtime.getURL('settings-init.json'));
      const defaultSettings = await response.json();
      chrome.storage.sync.set({ settings: defaultSettings });
    } catch (error) {
      console.error('Failed to load default settings from settings-init.json', error);
    }
  }
});

// Listen for a message from content script / popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'basic') {
    chrome.notifications.create(`antifeed-${Date.now()}`, {
      type: 'basic',
      iconUrl: 'images/antifeed-128.png',
      title: message.title,
      message: message.body,
      priority: 2
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Failed to show notification', chrome.runtime.lastError);
      }
    });
  }
});

// Allows users to open the side panel by clicking on the action toolbar icon
// TODO: Get this to work on all browsers, esp. Edge and Safari
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));