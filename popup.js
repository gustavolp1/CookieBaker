document.addEventListener('DOMContentLoaded', function() {
  chrome.runtime.sendMessage({ action: "getConnections" }, function(response) {
    let connections = response.connections;
    connections.forEach(connection => {
      let li = document.createElement('li');
      li.textContent = connection;
      document.getElementById('connections').appendChild(li);
    });
  });

  chrome.runtime.sendMessage({ action: "getCookies" }, function(response) {
    document.getElementById('firstPartyCookies').textContent = response.firstPartyCookies;
    document.getElementById('thirdPartyCookies').textContent = response.thirdPartyCookies;
  });

  chrome.runtime.sendMessage({ action: "getStorage" }, function(response) {
    document.getElementById('localStorageCount').textContent = response.localStorageCount;
    document.getElementById('sessionStorageCount').textContent = response.sessionStorageCount;
  });

  chrome.runtime.sendMessage({ action: "getPrivacyScore" }, function(response) {
    document.getElementById('privacyScore').textContent = response.privacyScore;
  });
});
