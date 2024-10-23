let thirdPartyConnections = [];
let firstPartyCookies = 0;
let thirdPartyCookies = 0;
let privacyScore = 100;
let hijackingDetected = false;

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      let currentTab = tabs[0];
      if (currentTab) {
        let tabUrl = new URL(currentTab.url).hostname;
        let thirdParty = new URL(details.url).hostname !== tabUrl;
        if (thirdParty) {
          thirdPartyConnections.push(details.url);
          console.log("Conexão com domínio de terceira parte detectada:", details.url);
        }
      }
    });
  },
  { urls: ["<all_urls>"] }
);

function detectCookies() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    let currentTab = tabs[0];
    if (currentTab) {
      chrome.cookies.getAll({ url: currentTab.url }, function(cookies) {
        cookies.forEach(cookie => {
          let isThirdParty = cookie.domain !== new URL(currentTab.url).hostname;
          if (isThirdParty) {
            thirdPartyCookies++;
            console.log("Cookie de terceira parte detectado:", cookie);
          } else {
            firstPartyCookies++;
            console.log("Cookie de primeira parte detectado:", cookie);
          }
        });
      });
    }
  });
}

function calculatePrivacyScore() {
  if (thirdPartyConnections.length > 0) {
    privacyScore -= 10;
    console.log("Redução de pontuação por conexões de terceiros:", thirdPartyConnections.length);
  }

  if (hijackingDetected) {
    privacyScore -= 30;
    console.log("Redução de pontuação por tentativa de hijacking");
  }

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.localStorageData && Object.keys(message.localStorageData).length > 0) {
      privacyScore -= 20;
      console.log("Redução de pontuação por dados no localStorage");
    }

    if (message.hijackingDetected) {
      hijackingDetected = true;
      console.log("Tentativa de hijacking detectada");
    }

    sendResponse({ privacyScore: privacyScore });
    console.log("Pontuação de privacidade final:", privacyScore);
  });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === "getStorage") {
    sendResponse({
      localStorageCount: Object.keys(message.localStorageData).length,
      sessionStorageCount: Object.keys(message.sessionStorageData).length
    });
  }

  if (message.hijackingDetected) {
    hijackingDetected = true;
  }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === "getConnections") {
    sendResponse({ connections: thirdPartyConnections });
  } else if (message.action === "getCookies") {
    sendResponse({
      firstPartyCookies: firstPartyCookies,
      thirdPartyCookies: thirdPartyCookies
    });
  } else if (message.action === "getPrivacyScore") {
    sendResponse({ privacyScore: privacyScore });
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    detectCookies();
    calculatePrivacyScore();
  }
});
