chrome.contextMenus.create({
  id: 'stopSpeak',
  title: 'Stop Speak',
  contexts: ['all']
});

chrome.contextMenus.create({
  id: "speakText",
  title: "Speak Text Src Lang",
  contexts: ["selection"]
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

chrome.contextMenus.create({
  id: "speechtotextstart",
  title: "Start Speech",
  contexts: ["all"]
});

chrome.contextMenus.create({
  id: "speechtotextstop",
  title: "Stop Speech",
  contexts: ["all"],
  enabled: false
});

/*
chrome.contextMenus.create({
  title: "Save as MP3",
  contexts: ["selection"],
  onclick: saveAsMP3
});

chrome.contextMenus.create({
  id: 'saveAsMP3New',
  title: 'Save as MP3 New',
  contexts: ['selection']
});
*/

document.head.innerHTML += "<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js\"></script>"; 

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === 'saveAsMP3New') {
    var selectedText = info.selectionText;
    saveAsMP3New(selectedText);
  }
  else if (info.menuItemId === "stopSpeak") {
    chrome.tts.stop();
  }else if (info.menuItemId === "speakTextAuto") {
  
  	var outputLang = "en";
chrome.i18n.detectLanguage(info.selectionText, function(result) {
if(result.languages){
	outputLang = result.languages[0].language;
	        chrome.tts.speak(info.selectionText.replace(/(?:\r\n|\r|\n|\/|:)/g, '...'), { lang: outputLang });

}
  });
  }else if (info.menuItemId === "speakText") {
  
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tabId = tabs[0].id;
  	var outputLang = "en";

    chrome.storage.local.get([tabId+"speakautocheckbox", tabId + "srclanguage", tabId + "tgtlanguage"], function(data) {

      var speakautocheckbox = data[tabId + "speakautocheckbox"] || false;
      var srclanguage = data[tabId + "srclanguage"] || "en_US";

      if(srclanguage=="en_US"){
        chrome.tts.speak(info.selectionText, { lang: srclanguage, voiceName: 'Alex'});
        
      }else{

      chrome.tts.speak(info.selectionText.replace(/(?:\r\n|\r|\n|\/|:)/g, '...'), { lang: srclanguage });
      }

    });
  });

  }else if (info.menuItemId === "recorder") {
    //chrome.tts.stop();
    var popup = window.open(
      "https://indojapcorp.github.io/mediarecorder/", 'popUpWindow1', 'height=250,width=400,left=0,top=0,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=no');
      popup.focus();
      // Focus the popup window continuously
  // var focusInterval = setInterval(function() {
  //   if (popup && !popup.closed) {
  //     popup.focus();
  //   } else {
  //     clearInterval(focusInterval);
  //   }
  // }, 200);


  }else if (info.menuItemId === "speechtotextstart"){
    chrome.contextMenus.update('speechtotextstart', { enabled: false });
    chrome.contextMenus.update('speechtotextstop', { enabled: true });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tabId = tabs[0].id;
   // chrome.tabs.executeScript(tab.id, { code: 'setSpeechLanguage("en");' });
   chrome.storage.local.get(tabId+'srclanguage', function(data) {
    var srclanguage = data[tabId + "srclanguage"] || "en_US";
   chrome.tabs.executeScript(tab.id, {
    code: `
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.interimResults = false;
      
        recognition.lang = '${srclanguage}';


        recognition.onresult = function(event) {
          const transcript = event.results[event.results.length - 1][0].transcript;
          console.log("transcript="+transcript.trim().toUpperCase());

          if(transcript.trim().toUpperCase() == 'STOP' || transcript.trim().toUpperCase() == 'स्टॉप' || transcript.trim().toUpperCase() == '終わり'){
            console.log("Stopped");
            recognition.stop();
          }
          const inputField = document.activeElement;
          console.log('Speech recognition transcript='+transcript);
          if (inputField && (inputField.nodeName === 'INPUT' || inputField.nodeName === 'TEXTAREA')) {
            inputField.value += transcript.trim() + '\\n';
          }

        };
      
        recognition.start();

        window.stopSpeechRecognition = function() {
          recognition.stop();
        };

      } else {
        console.log('Speech recognition not supported');
      }
    `
  });
   });
  });
  }else if (info.menuItemId === "speechtotextstop"){
    chrome.tabs.executeScript(tab.id, { code: 'stopSpeechRecognition();' });
    chrome.contextMenus.update('speechtotextstart', { enabled: true });
    chrome.contextMenus.update('speechtotextstop', { enabled: false });
  }
});


function fetchDefinition(word, callback) {

  const pattern = /(?:\r\n|\r|\n|\/|:)/;
  if (pattern.test(word)) {
    return;
  }

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
//var valtxt;
//var spkonsleval;
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

if (request.word) {

    chrome.i18n.detectLanguage(request.word, function (result) {

      var outputLang = "en";
      if (result && result.languages[0]) {
        outputLang = result.languages[0].language;
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

    // chrome.tts.getVoices(
    //   function(voices) {
    //     for (var i = 0; i < voices.length; i++) {
    //       console.log('Voice ' + i + ':');
    //       console.log('  name: ' + voices[i].voiceName);
    //       console.log('  lang: ' + voices[i].lang);
    //       console.log('  extension id: ' + voices[i].extensionId);
    //       console.log('  event types: ' + voices[i].eventTypes);
    //     }
    //   }
    // );

    var outputLang = "en";
    var textToSpeak=request.speak.replace(/(?:\r\n|\r|\n|\/|:)/g, '...');
    //console.log(textToSpeak);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tabId = tabs[0].id;
    chrome.storage.local.get([tabId+"speakautocheckbox", tabId + "srclanguage", tabId + "tgtlanguage"], function(data) {

      var speakautocheckbox = data[tabId + "speakautocheckbox"] || false;
      var tgtlanguage = data[tabId + "tgtlanguage"] || "en_US";

      
      if(speakautocheckbox){
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
      }else{
        chrome.tts.speak(textToSpeak, { lang: tgtlanguage });
      }
    });
    });

    return true;

  } else if (request.stopspeak) {
    chrome.tts.stop();
    sendResponse({ deflang: "stopped" });
  } else if (request.slttxtval) {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tabId = tabs[0].id;
      var spkonseltxt=tabs[0].id+"spkonseltxt";
      var valtxt;
      var spkonsleval;

      chrome.storage.local.get([tabs[0].id+"seltxt",tabs[0].id+"spkonseltxt"], function (data) {
        var valtxt = data[tabs[0].id+"seltxt"];
        var spkonsleval = data[tabs[0].id+"spkonseltxt"];
        //console.log("spkonsleval in bg="+spkonsleval)
        sendResponse({ deflang: valtxt , spkonsel: spkonsleval });
      });

      // chrome.storage.local.get(tabs[0].id+"seltxt", function (data) {
      //   valtxt = data[tabs[0].id+"seltxt"];
      // });
      // chrome.storage.local.get(spkonseltxt, function (data) {
      //   spkonsleval = data[spkonseltxt];
      // });
      
    });
    
    //sendResponse({ deflang: valtxt , spkonsel: spkonsleval });
    return true;
  }else if (request.message === "getTranslationValues") {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tabId = tabs[0].id;
    // // Get the checkbox value from the storage
    // chrome.storage.local.get(tabId+"gtcheckbox", function(data) {
    //   var value = data[tabId+"gtcheckbox"] || false;
    //   console.log("val in bg="+value)
    //   // Send the checkbox value back to the content script
    //   sendResponse({ value: value });
    // });

    chrome.storage.local.get([tabId+"gtcheckbox", tabId + "srclanguage", tabId + "tgtlanguage"], function(data) {
      var chkvalue = data[tabId + "gtcheckbox"] || "false";
      var srclanguage = data[tabId + "srclanguage"] || "en_US";
      var tgtlanguage = data[tabId + "tgtlanguage"] || "en_US";

      // Send the language values back to the content script
      sendResponse({ chkvalue: chkvalue, srclanguage: srclanguage, tgtlanguage: tgtlanguage });
    });

   // console.log("returning false")
    // Indicate that the response will be sent asynchronously
  });
  //sendResponse({ value: true });
  return true;
  }

});

// Clear storage values when the browser is closed
chrome.runtime.onSuspend.addListener(function() {
  chrome.storage.local.clear();
});

// Clear local storage value for the tab when it is closed
chrome.tabs.onRemoved.addListener(function(tabId) {
  chrome.storage.local.remove(tabId.toString());
});

function saveAsMP3() {
  chrome.tabs.executeScript({
    code: 'window.getSelection().toString();'
  }, function (selection) {
    if (selection && selection[0]) {
      var selectedText = selection[0];
      var utterance = new SpeechSynthesisUtterance(selectedText);
      var audio = new Audio();
      var blobURL;

      utterance.addEventListener('end', function () {
        audio.src = blobURL;
        var link = document.createElement('a');
        link.href = blobURL;
        link.download = 'text_to_speech.mp3';
        link.click();
        URL.revokeObjectURL(blobURL);
      });

      speechSynthesis.addEventListener('voiceschanged', function () {
        var voices = speechSynthesis.getVoices();
        utterance.voice = voices[0]; // You can choose a specific voice here if you have multiple voices installed.
        var blob = new Blob([selectedText], { type: 'text/plain' });
        blobURL = URL.createObjectURL(blob);
        speechSynthesis.speak(utterance);    
      });
    }
  });
}

function saveAsMP3New(selectedText) {
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var utterance = new SpeechSynthesisUtterance(selectedText);

  var voicesChangedListener = function() {
    speechSynthesis.removeEventListener('voiceschanged', voicesChangedListener);
    var audioBuffer = audioCtx.createBufferSource();
    var audioDestination = audioCtx.createMediaStreamDestination();
    audioBuffer.buffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
    audioBuffer.connect(audioDestination);

    utterance.voice = speechSynthesis.getVoices()[0];
    utterance.addEventListener('end', function() {
      audioCtx.resume().then(function() {
        audioCtx.suspend().then(function() {
          var audioStream = audioDestination.stream;
          var mediaRecorder = new MediaRecorder(audioStream);
          var chunks = [];

          mediaRecorder.addEventListener('dataavailable', function(event) {
            chunks.push(event.data);
          });

          mediaRecorder.addEventListener('stop', function() {
            var blob = new Blob(chunks, { type: 'audio/mp3' });
            var url = URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = url;
            link.download = 'text_to_speech.mp3';
            link.click();
            URL.revokeObjectURL(url);
          });

          mediaRecorder.start();
          audioCtx.resume();
          setTimeout(function() {
            mediaRecorder.stop();
            audioCtx.close();
          }, 500);
        });
      });
    });

    speechSynthesis.speak(utterance);
  };

  speechSynthesis.addEventListener('voiceschanged', voicesChangedListener);
}
