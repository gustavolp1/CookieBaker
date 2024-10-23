function checkHooks() {
  const nativeAlert = window.alert;
  const nativePrompt = window.prompt;
  const nativeConfirm = window.confirm;

  let hooksDetected = false;

  if (window.alert !== nativeAlert) {
    console.log("Hijacking detected: window.alert foi modificado!");
    hooksDetected = true;
  }
  if (window.prompt !== nativePrompt) {
    console.log("Hijacking detected: window.prompt foi modificado!");
    hooksDetected = true;
  }
  if (window.confirm !== nativeConfirm) {
    console.log("Hijacking detected: window.confirm foi modificado!");
    hooksDetected = true;
  }

  return hooksDetected;
}

function checkDomChanges() {
  const suspiciousTags = ['iframe', 'script', 'form'];

  let hijackingDetected = false;

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => {
          if (suspiciousTags.includes(node.tagName?.toLowerCase())) {
            console.log("Hijacking detected: Elemento suspeito adicionado ao DOM ->", node.tagName);
            hijackingDetected = true;
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return hijackingDetected;
}

function detectHijacking() {
  const hooksHijacking = checkHooks();
  const domHijacking = checkDomChanges();

  if (hooksHijacking || domHijacking) {
    chrome.runtime.sendMessage({ hijackingDetected: true });
  } else {
    chrome.runtime.sendMessage({ hijackingDetected: false });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  detectHijacking();
});
