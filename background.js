chrome.contextMenus.create({
  id: 'stopSpeak',
  title: 'Stop Speak',
  contexts: ['all']
});

chrome.contextMenus.create({
  id: "speakTextAuto",
  title: "Speak Text Auto Detect Lang",
  contexts: ["selection"]
});

chrome.contextMenus.create({
  id: "recorder",
  title: "Show Recorder",
  contexts: ["all"]
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "stopSpeak") {
    chrome.tts.stop();
  }else if (info.menuItemId === "speakTextAuto") {
  
  	var outputLang = "en";
chrome.i18n.detectLanguage(info.selectionText, function(result) {
if(result.languages){
	outputLang = result.languages[0].language;
	        chrome.tts.speak(info.selectionText.replace(/(?:\r\n|\r|\n|\/|:)/g, '...'), { lang: outputLang });

}
  });
  }else if (info.menuItemId === "recorder") {
    //chrome.tts.stop();
    var win = window.open(
      "https://indojapcorp.github.io/mediarecorder/", 'popUpWindow1', 'height=250,width=400,left=0,top=0,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=no');
    win.focus();
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
var spkonsleval;
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.word) {

    chrome.i18n.detectLanguage(request.word, function (result) {

      var outputLang = "en";
      if (result && result.languages[0]) {
        outputLang = result.languages[0].language;
        console.log("outputLang in word="+outputLang);
        if(outputLang!="ja" && outputLang!="zh"){
          fetchDefinition(request.word, (definition) => {
            sendResponse({ definition });
          });   
        }
      }
    });

    // fetchDefinition(request.word, (definition) => {
    //   sendResponse({ definition });
    // });
    return true;
  } else if (request.speak) {
    var outputLang = "en";
    var textToSpeak=request.speak.replace(/(?:\r\n|\r|\n|\/|:)/g, '...');
    console.log(textToSpeak);
    chrome.i18n.detectLanguage(request.speak, function (result) {

      const REGEX_CHINESE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
      const hasChinese = request.speak.match(REGEX_CHINESE);

      if (result && result.languages[0]) {
        outputLang = result.languages[0].language;
        if(!result.isReliable && outputLang!="ja" && outputLang!="zh"){
          outputLang="en";
        }else if(!hasChinese && (outputLang=="ja" || outputLang=="zh")){
          outputLang="en";
        }else if(hasChinese && (outputLang=="ja" || outputLang=="zh")){
          outputLang="ja";
        }
        
        console.log("outputLang="+outputLang);
        if(outputLang=="en"){
          chrome.tts.speak(textToSpeak, { lang: outputLang, voiceName: 'Alex'});
          
        }else{
          chrome.tts.speak(textToSpeak, { lang: outputLang });
        }
        sendResponse({ deflang: result.languages[0].language });
      }else{
        outputLang = "en";
        chrome.tts.speak(textToSpeak, { lang: outputLang , voiceName: 'Alex' });
        sendResponse({ deflang: "en" });
      }
    });

  } else if (request.stopspeak) {
    chrome.tts.stop();
    sendResponse({ deflang: "stopped" });
  } else if (request.slttxtval) {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tabId = tabs[0].id;
      var spkonseltxt=tabs[0].id+"spkonseltxt";
      chrome.storage.local.get(tabId.toString(), function (data) {
        valtxt = data[tabId];
      });
      chrome.storage.local.get(spkonseltxt, function (data) {
        spkonsleval = data[spkonseltxt];
      });
      
    });
    console.log("spkonsleval in bg="+spkonsleval)
    sendResponse({ deflang: valtxt , spkonsel: spkonsleval });

  }
});