/** Imports settings and initializes the panel*/
chrome.storage.sync.get(['settings'], function(data) {
  // Access the settings data
  var settings = data.settings || {};

  // Finds elements we need
  const settingsContainer = document.getElementById('settings-container');

  // Initialize the settings in the panel based on the stored settings
  Object.entries(settings).forEach(([platformName, platformValues]) => {
    // Some variables we need
    var platformId = platformName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    var isOpen = platformValues.open;
    var blockPlatform = platformValues.block;
    const { blockFeeds = {}, whitelist = {} } = platformValues; // Destruct feeds and whitelist
    
    // Creates the h2
    const platformHeader = document.createElement('h2');
    platformHeader.id = platformId + '-header';
    platformHeader.className = 'platform-header';
    platformHeader.innerHTML = '<span class="platform-name">' + platformName + '</span>&ensp;';
    settingsContainer.appendChild(platformHeader);

    /** Adds the platform toggle **/
    //Creates the label
    const platformLabel = document.createElement('label');
    platformLabel.className = 'switch platform-switch';
    platformHeader.appendChild(platformLabel);
    // Creates the checkbox
    const platformToggle = document.createElement('input')
    platformToggle.type = 'checkbox';
    platformToggle.className = 'toggle ' + 'platform-toggle';
    platformToggle.name = platformId + '-toggle';
    platformToggle.checked = blockPlatform;
    platformToggle.addEventListener('change', function() {
      togglePlatform(platformName, platformId, this.checked);
    });
    platformLabel.appendChild(platformToggle);
    const platformSlider = document.createElement('span');
    platformSlider.className = 'slider platform-slider';
    platformSlider.title = blockPlatform ? 'Unblock all feeds on ' + platformName : 'Block all feeds on ' + platformName;
    platformLabel.appendChild(platformSlider);
    platformHeader.appendChild(document.createTextNode('\u2002'));

    // Adds the show more button
    const showMoreButton = document.createElement('button');
    showMoreButton.id = platformId + '-showmore';
    showMoreButton.className = 'show-more-settings';
    showMoreButton.innerHTML = isOpen ? '<i class="fas fa-caret-up"></i>' : '<i class="fas fa-caret-down"></i>';
    showMoreButton.addEventListener('click', function() {
      toggleDropdown(platformName, platformId);
    });
    platformHeader.appendChild(showMoreButton);

    // Creates the settings block
    const platformSettings = document.createElement('div');
    platformSettings.id = platformId + '-settings';
    platformSettings.className = 'platform-settings row';
    platformSettings.style.display = isOpen ? 'block' : 'none';
    settingsContainer.appendChild(platformSettings);

    // Creates the feed settings
    const feeddiv = document.createElement('div');
    feeddiv.className = 'feed-settings col';
    platformSettings.appendChild(feeddiv);

    // Creates the feed header
    const feedHeader = document.createElement('h3');
    feedHeader.textContent = 'Block Feeds:';
    feeddiv.appendChild(feedHeader);

    // Create the feed toggle list empty objects
    Object.entries(blockFeeds).forEach(([feedName, feedValue]) => {
      //variables we need
      var feedNameLower = feedName.toLowerCase().replace(/\s+/g, '-');
      
      // Creates the feed setting block
      const feedSetting = document.createElement('div');
      feedSetting.id = platformId + '-' + feedNameLower;
      feedSetting.className = 'feed-setting';
      feeddiv.appendChild(feedSetting);

      // Creates the label
      const label = document.createElement('label');
      label.className = 'switch';
      feedSetting.appendChild(label);

      // Creates the checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = platformId + '-feed-toggle';
      checkbox.name = platformId + '-' + feedNameLower + '-toggle';
      checkbox.disabled = !blockPlatform;
      checkbox.checked = feedValue;
      checkbox.addEventListener('change', function() {
        toggleFeed(platformName, feedName, this.checked);
      });
      label.appendChild(checkbox);
      const slider = document.createElement('span');
      slider.className = 'slider ' + platformId + '-feed-slider' + (blockPlatform ? '' : ' disabled');
      label.appendChild(slider);

      // Creates the feed label
      const feedLabel = document.createElement('span');
      feedLabel.innerHTML = '&ensp;' + feedName;
      feedSetting.appendChild(feedLabel);

      // Adds a break
      feeddiv.appendChild(document.createElement('br'));
    });

    // Creates the whitelist settings
    const whitelistdiv = document.createElement('div');
    whitelistdiv.className = 'whitelist-settings col';
    platformSettings.appendChild(whitelistdiv);

    // Creates the whitelist header
    const whitelistHeader = document.createElement('h3');
    whitelistHeader.textContent = 'Whitelist:';
    whitelistdiv.appendChild(whitelistHeader);

    // Creates whitelist source display
    const whitelistSrcDisplay = document.createElement('p');
    whitelistSrcDisplay.id = platformId + '-whitelist-src-display';
    whitelistSrcDisplay.className = 'whitelist-src-display';
    whitelistSrcDisplay.textContent = platformValues.whitelistSrc || 'None';
    whitelistdiv.appendChild(whitelistSrcDisplay);

    // Creates the whitelist source input
    const whitelistInput = document.createElement('input');
    whitelistInput.type = 'text';
    whitelistInput.placeholder = 'Enter URL to whitelist';
    whitelistInput.id = platformId + '-whitelist-input';
    whitelistInput.value = platformValues.whitelistSrc || '';
    whitelistdiv.appendChild(whitelistInput);

    // Creates a submit button for the whitelist source input
    const whitelistSubmitButton = document.createElement('button');
    whitelistSubmitButton.type = 'button';
    whitelistSubmitButton.className = 'whitelist-submit-button';
    whitelistSubmitButton.textContent = 'Save';
    whitelistSubmitButton.addEventListener('click', function() {
      inputWhitelistSource(platformName, whitelistInput.value, platformId);
    });
    whitelistdiv.appendChild(whitelistSubmitButton);

    // Allow Enter key to submit the current whitelist input value.
    whitelistInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        inputWhitelistSource(platformName, whitelistInput.value, platformId);
      }
    });
  });
});

/** Creates the toggle settings functionality **/
function toggleDropdown(platformName, platformId) {
  // Shows or hides the settings block as a single layout change.
  const button = document.getElementById(platformId + "-showmore");
  const element = document.getElementById(platformId + "-settings");
  const shouldOpen = element.style.display === "none";

  // Update UI immediately for responsiveness.
  element.style.display = shouldOpen ? "block" : "none";
  button.innerHTML = shouldOpen ? '<i class="fas fa-caret-up"></i>' : '<i class="fas fa-caret-down"></i>';

  // Persist by writing the nested object
  chrome.storage.sync.get(['settings'], function(data) {
    var settings = data.settings || {};
    if (settings[platformName]) {
      settings[platformName].open = shouldOpen;
      chrome.storage.sync.set({ settings: settings });
    }
  });
}

/** Creates the toggle settings functionality for parent platforms */
function togglePlatform(platformName, platformId, value) {
  // Updates the setting in storage
  chrome.storage.sync.get(['settings'], function(data) {
    var settings = data.settings;
    if ( settings && settings[platformName] ) {
      // Disable all feed toggles
      document.querySelectorAll('.' + platformId + '-feed-toggle').forEach(element => {
        if (!value) {
          element.setAttribute('disabled', '');
        } else {
          element.removeAttribute('disabled');
        }
      });
      document.querySelectorAll('.' + platformId + '-feed-slider').forEach(element => {
        if (!value) {
          element.classList.add('disabled');
        } else {
          element.classList.remove('disabled');
        }
      });

      // Update the extension settings
      settings[platformName].block = value;
      chrome.storage.sync.set({ settings: settings });
    }
  });

  /* Send a toast notification instucting user to reload the page to apply changes. */
  // Gets the current page URL
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentUrl = tabs[0]?.url;
    // Gets the platform's settings to check the domain.
    chrome.storage.sync.get(['settings'], function(data) {
      var settings = data.settings;
      if (settings && currentUrl?.includes(settings[platformName].domain)) {
        setTimeout(() => {
          // Sends notifications
          chrome.runtime.sendMessage({
            type: 'basic',
            title: value ? 'Platform Blocked' : 'Platform Unblocked',
            body: 'Reload page to apply changes.'
          });
        }, 300);
      }
    });
  });
}

/** Creates the toggle settings functionality for feeds **/
function toggleFeed(platformName, feedName, value) {
  // Updates the setting in storage
  chrome.storage.sync.get(['settings'], function(data) {
    var settings = data.settings;
    if ( settings && settings[platformName] && settings[platformName].blockFeeds &&
      Object.prototype.hasOwnProperty.call(settings[platformName].blockFeeds, feedName) ) {
      // Update the extension settings
      settings[platformName].blockFeeds[feedName] = value;
      chrome.storage.sync.set({ settings: settings });
    }
  });

  /* Send a toast notification instucting user to reload the page to apply changes. */
  // Gets the current page URL
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentUrl = tabs[0]?.url;
    // Gets the platform's settings to check the domain.
    chrome.storage.sync.get(['settings'], function(data) {
      var settings = data.settings;
      if (settings && currentUrl?.includes(settings[platformName].domain)) {
        setTimeout(() => {
          // Sends notifications
          chrome.runtime.sendMessage({
            type: 'basic',
            title: value ? 'Feed Blocked' : 'Feed Unblocked',
            body: 'Reload page to apply changes.'
          });
        }, 300);
      }
    });
  });
}

function inputWhitelistSource(platform, value, platformId) {
  // Updates the setting in storage
  chrome.storage.sync.get(['settings'], function(data) {
    var settings = data.settings;
    if ( settings && settings[platform] ) {
      // Update the whitelist source for the platform
      settings[platform].whitelistSrc = value;
      chrome.storage.sync.set({ settings: settings });

      // Update the display of the current whitelist source
      const whitelistSrcDisplay = document.getElementById(platformId + '-whitelist-src-display');
      if (whitelistSrcDisplay) {
        whitelistSrcDisplay.textContent = (value || 'None');
      }
    }
  });
}