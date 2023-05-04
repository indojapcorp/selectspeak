chrome.contextMenus.create({
  id: 'stopSpeak',
  title: 'Stop Speak',
  contexts: ['all']
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "stopSpeak") {
    chrome.tts.stop();
  }
});


function fetchDefinition(word, callback) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0 && data[0].meanings.length > 0 && data[0].meanings[0].definitions.length > 0) {
        callback(data[0].meanings[0].definitions[0].definition);
      } else {
        callback(null);
      }
    })
    .catch(() => {
      callback(null);
    });
}
var valtxt;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.word) {
    fetchDefinition(request.word, (definition) => {
      sendResponse({ definition });
    });
    return true;
  } else if (request.speak) {
    var outputLang = "en";
    chrome.i18n.detectLanguage(request.speak, function (result) {
      if (result.languages) {
        outputLang = result.languages[0].language;
        chrome.tts.speak(request.speak, { lang: outputLang });
        sendResponse({ deflang: result.languages[0].language });
      }
    });

  } else if (request.stopspeak) {
    chrome.tts.stop();
    sendResponse({ deflang: "stopped" });
  } else if (request.slttxtval) {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tabId = tabs[0].id;
      chrome.storage.local.get(tabId.toString(), function (data) {
        valtxt = data[tabId];
      });
    });
    sendResponse({ deflang: valtxt });

  }
});