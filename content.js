// Get the URL of the popup.css file

const cssUrl = chrome.runtime.getURL('styles.css');
document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" type="text/css" href="${cssUrl}">`);

let currentWord = null;

function createDefinitionPopup(selectedWord, definition, showdef) {

  console.log("selectedWord="+selectedWord);
  console.log("definition="+definition);
  removeDefinitionPopup();
  const popup = document.createElement("div");
  popup.setAttribute("id", "popup");

  popup.classList.add('dictionary-popup');

  if (showdef) {
    const popupText = document.createElement("div");
    //popupText.setAttribute('contenteditable', 'true');

    popupText.className = "dictionary-popup-text";
    popupText.innerHTML = definition;
    //popupText.textContent = definition;
    popup.appendChild(popupText);
  } else {
    const popupText = document.createElement("div");
    popupText.className = "dictionary-popup-text";
    const s = popupText.style;
    // s.backgroundColor = "azure";
    // s.margin          = "3px";
    // s.borderRadius    = "5px";
    // s.padding         = "2px";
    s.whiteSpace = 'pre';  // <-- Right here.

    //console.log("chk="+gtcheckboxEnabled);

    // Send a message to the background script requesting the checkbox value
    chrome.runtime.sendMessage({ message: "getTranslationValues" }, function (response) {
      if (response && response.chkvalue !== undefined) {
        var isChecked = response.chkvalue;

        if (isChecked) {
          var translatedVal;
          //translate(selectedWord,"en","ja")
          translate(selectedWord, response.srclanguage, response.tgtlanguage)
            .then(result => {
              definition = result; // Assign the result to the global variable
              //console.log("translatedVal="+definition); // Log the value of translatedVal
              popupText.textContent = definition;
              popup.appendChild(popupText);
            });
        }
        // Use the value as needed
      }
    });



  }

  const popupButtons = document.createElement("div");
  popupButtons.className = "dictionary-popup-buttons";


  // Create a "Speak" button to speak the definition
  const speakButton = document.createElement("button");
  speakButton.setAttribute("id", "speakButton");
  speakButton.classList.add('dictionary-popup-speak-button');
  speakButton.textContent = "Speak";
  speakButton.addEventListener("click", () => {
    //speakText(selectedWord+"..."+definition.replace(/(?:\r\n|\r|\n|\/)/g, '...'));
    if (showdef) {
      //speakText(selectedWord + "..." + definition);
      speakText(selectedWord);
    } else {
      speakText("..." + definition);
    }
  });
  popupButtons.appendChild(speakButton);

  // Create a "Stop" button to stop the speech
  const stopButton = document.createElement("button");
  stopButton.setAttribute("id", "stopSpeakButton");
  stopButton.classList.add('dictionary-popup-stop-button');

  stopButton.textContent = "Stop";
  stopButton.disabled = false;
  stopButton.addEventListener("click", () => {
    stopSpeakText(definition);
  });
  popupButtons.appendChild(stopButton);


  const closeButton = document.createElement("button");
  closeButton.setAttribute("id", "closeButton");
  closeButton.classList.add('dictionary-popup-close-button');

  closeButton.textContent = "Close";
  closeButton.disabled = false;
  closeButton.addEventListener("click", () => {
    removeDefinitionPopup();
  });
  popupButtons.appendChild(closeButton);


    // Create a "Speak" button to speak the definition
    const speakTransButton = document.createElement("button");
    speakTransButton.setAttribute("id", "speakTransButton");
    speakTransButton.classList.add('dictionary-popup-speak-button');
    speakTransButton.textContent = "Speak Trans";
    speakTransButton.addEventListener("click", () => {
     // speakText(definition);
     console.log("definition bef tgttext="+definition);
      speakTextTgtText(definition);
    });
    popupButtons.appendChild(speakTransButton);

    
  // Create a "Speak" button to speak the definition
  const translateButton = document.createElement("button");
  translateButton.setAttribute("id", "translateButton");
  translateButton.classList.add('dictionary-popup-speak-button');
  translateButton.textContent = "Translate";
  translateButton.addEventListener("click", () => {
    console.log("Before calling translate="); // Log the value of translatedVal

        // Send a message to the background script requesting the checkbox value
        chrome.runtime.sendMessage({ message: "getTranslationValues" }, function (response) {
          if (response && response.chkvalue !== undefined) {
            var isChecked = response.chkvalue;
    
            if (isChecked) {
              var translatedVal;
              //translate(selectedWord,"en","ja")
              translate(selectedWord, response.srclanguage, response.tgtlanguage)
                .then(result => {
                  definition = result; // Assign the result to the global variable
                  console.log("translatedVal="+definition); // Log the value of translatedVal

                  var popuptrasnText = document.getElementById('popuptrasnTextDiv');
                  if(!popuptrasnText){
                    popuptrasnText = document.createElement("div");
                    popuptrasnText.setAttribute("id", "popuptrasnTextDiv");
                    popuptrasnText.className = "dictionary-popup-text";
                    const s = popuptrasnText.style;
                    s.whiteSpace = 'pre';  // <-- Right here.                  
                    popuptrasnText.textContent = definition;  
                    popup.appendChild(popuptrasnText);
                  }else{
                    popuptrasnText.textContent = definition;  
                  }
                  // const popuptrasnText = document.createElement("div");
                  // popuptrasnText.setAttribute("id", "popuptrasnTextDiv");
                  // popuptrasnText.className = "dictionary-popup-text";
                  // const s = popuptrasnText.style;
                  // s.whiteSpace = 'pre';  // <-- Right here.                  
                  // popuptrasnText.textContent = definition;
                  //popup.appendChild(popuptrasnText);
                });
            }
            // Use the value as needed
          }
        });
    // //speakText(selectedWord+"..."+definition.replace(/(?:\r\n|\r|\n|\/)/g, '...'));
    // if (showdef) {
    //   //speakText(selectedWord + "..." + definition);
    //   speakText(selectedWord);
    // } else {
    //   speakText("..." + definition);
    // }
  });
  popupButtons.appendChild(translateButton);
  //translateButton.click();
  popup.appendChild(popupButtons);

  return popup;
}


function showDefinitionPopup(selectedWord, definition, x, y, showdef) {
  const popup = createDefinitionPopup(selectedWord, definition, showdef);
  popup.style.left = x + "px";
  popup.style.top = y + "px";
  document.body.appendChild(popup);
}

function removeDefinitionPopup() {
  //const popup = document.getElementById("google-dictionary-hover-popup");
  const popup = document.getElementById("popup");
  if (popup) {
    popup.remove();
    //console.log("remove");
  }
  currentWord = null;
}

function containsWhitespace(str) {
  return str.match(/\r|\n|\s/) !== null;
}

function getSelectionCoordinates() {
  var range = window.getSelection().getRangeAt(0);
  var startNode = range.startContainer;
  var startOffset = range.startOffset;
  var dummyRange = document.createRange();
  dummyRange.setStart(startNode, startOffset);
  dummyRange.setEnd(startNode, startOffset);

  var dummyRect = dummyRange.getBoundingClientRect();
  var x = dummyRect.left;
  var y = dummyRect.bottom;

  return { x: x, y: y };
}

function containsJapaneseCharacters(text) {
  // Use a regular expression to check for Japanese characters
  const japanesePattern = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;
  return japanesePattern.test(text);
}

function getSelectionXStart(selection) {
  if (selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  return rect.left; // This will give you the x-coordinate where the selection started.
}


function handleMouseUp(event) {
  var source = event.target || event.srcElement;

  console.log("In handleMouseUp source=" + source);


  if (source.id == 'speakButton' || source.id == 'stopSpeakButton' || source.id == 'closeButton' || source.id == 'translateButton' || source.id == 'speakTransButton') {
    return;
  }

  if (currentWord) {
    removeDefinitionPopup();
    currentWord = null;
  }
  const selection = window.getSelection();
  const lines = selection.toString().trim().split(/\r?\n/);

  //var selectedWord = selection.toString().trim();

  // Filter lines to remove those containing only numeric text or "NEW"
  const filteredLines = lines.filter((line) => {
  // Remove leading and trailing whitespace
  const trimmedLine = line.trim();

  // Check if the line is not "NEW" and is not a numeric value
  return trimmedLine !== "NEW" && !/^\d+$/.test(trimmedLine);
  });

  // Join the filtered lines back together with new lines
  const selectedWord = filteredLines.join('\n');


  if (selectedWord) {
    currentWord = selectedWord;
    //const x = event.pageX;
    const y = event.pageY+2;

    const x = getSelectionXStart(selection);
    const xEnd = event.pageX;


    console.log("selectedWord=" + selectedWord);

    const REGEX_CHINESE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
    const hasChinese = selectedWord.match(REGEX_CHINESE);

    console.log("hasJapChinese=" + containsJapaneseCharacters(selectedWord));

    if (containsJapaneseCharacters(selectedWord)) {

      chrome.runtime.sendMessage({ initKuroshiro: "" });

      chrome.runtime.sendMessage({ showRomaji: selectedWord}, (response) => {

        if (response && response.romaji) {
          showDefinitionPopup(selectedWord, response.romaji, x + 5, y + 10, true);
        }
      });

      //var kuroshiro = new Kuroshiro();
      // kuroshiro2.init(new KuromojiAnalyzer({ dictPath: "https://indojapcorp.github.io/TechNotes/tts/js/dict" }))
      // .then(function () {
      //         return kuroshiro.convert(selectedWord, { mode:"furigana",  to: "romaji" });
      //         return kuroshiro.convert(selectedWord, { mode:"spaced",  to: "romaji" });
      //     })
      //     .then(function(result){
      //       console.log("furigana="+result);
      //         //document.getElementById("furigana").innerHTML = '<strong>Furigana:</strong> ' + result;
      //     });

    } else {


      if (!containsWhitespace(selectedWord)) {
        chrome.runtime.sendMessage({ word: selectedWord }, (response) => {
          if (response && response.definition) {
            showDefinitionPopup(selectedWord +"..."+response.definition, response.definition, x + 5, y + 10, true);
          } else if (response) {
            showDefinitionPopup(selectedWord, "", x + 5, y + 10, true);
          }
        });
      } else {
        var coordinates = getSelectionCoordinates();
        showDefinitionPopup(selectedWord, selectedWord, coordinates.x, coordinates.y, false);
      }
    }

    chrome.runtime.sendMessage({ action: "getWriteOnSelection" }, function (response) {

      if(response.writeOnSelection){
        chrome.tabs.sendMessage(sender.tab.id, { action: 'saveSelectedTextToClipboard', selectedWord });
      }
    });

    
    // const writeOnSelectionCheckbox = document.getElementById('writeOnSelection');
    // console.log(selectedWord);
    // if (writeOnSelectionCheckbox.checked) {
    //   chrome.tabs.sendMessage(sender.tab.id, { action: 'saveSelectedTextToClipboard', selectedWord });
    // }


    // chrome.runtime.sendMessage({ saveSelectedTextToClipboard: selectedWord }, (response) => {
    // });

  }
}

//document.addEventListener("mouseup", handleMouseUp);

document.addEventListener("mouseup", (event) => {

  const selection = window.getSelection();
  const selectedWord = selection.toString().trim();
  console.log("IN Mouse up");
  chrome.runtime.sendMessage({ saveSelectedTextToClipboard: selectedWord });

  // const writeOnSelectionCheckbox = document.getElementById('writeOnSelection');
  // console.log(selectedWord);
  // if(writeOnSelectionCheckbox.checked){
  //   chrome.runtime.sendMessage({ saveSelectedTextToClipboard: selectedWord });
  // }

  if (chrome.runtime?.id) {

    chrome.runtime.sendMessage({ slttxtval: "abc" }, (response) => {

      if (response.spkonsel && response.spkonsel) {
        const selection = window.getSelection();
        const selectedWord = selection.toString().trim();
        speakText(selectedWord);
      }

      if (response && response.deflang && response.deflang) {
        console.log("IN mouse up calling handleMouseUp");
        handleMouseUp(event);
      }
    });
  }

});



document.addEventListener("mousedown", (event) => {
  console.log("IN mouse down");
  var source = event.target || event.srcElement;

  if (source.id == 'speakButton' || source.id == 'stopSpeakButton' || source.id == 'translateButton' || source.id == 'speakTransButton') {
  }
  else if (event.button === 0 && currentWord) {
    if (source.id != 'speakButton' && source.id != 'stopSpeakButton' || source.id != 'translateButton' || source.id != 'speakTransButton') {
      event.preventDefault();
      currentWord = null;
      var selection = window.getSelection();
      selection.removeAllRanges();
      removeDefinitionPopup();
    }
  }
  else {
    removeDefinitionPopup();
  }
});

var win;
var gtcheckboxEnabled = false;
document.addEventListener("DOMContentLoaded", function () {

  // if(!win){
  // win = window.open(
  //   "https://indojapcorp.github.io/mediarecorder/", 'popUpWindow1', 'height=250,width=400,left=0,top=0,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=no');
  // win.focus();
  // }



  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tabId = tabs[0].id;
    var spkonseltxtfortabid = tabs[0].id + "spkonseltxt";



    chrome.storage.local.get([tabId.toString(), tabId + "speakautocheckbox", tabId + "seltxt", tabId + "spkonseltxt", tabId + "gtcheckbox", tabId + "srclanguage", tabId + "tgtlanguage", tabId + "speaklanguage", tabId + "fileLocation", tabId + "writeOnSelection"], function (data) {
      document.getElementById("seltxt").checked = data[tabs[0].id + "seltxt"];
      document.getElementById("spkonseltxt").checked = data[tabs[0].id + "spkonseltxt"];
      document.getElementById("srclanguage").value = data[tabs[0].id + "srclanguage"] || "en-US";
      document.getElementById("tgtlanguage").value = data[tabs[0].id + "tgtlanguage"] || "ja-JP";
      document.getElementById("speaklanguage").value = data[tabs[0].id + "srclanguage"] || "en-US";      
      document.getElementById("gtcheckbox").checked = data[tabId + "gtcheckbox"];
      document.getElementById("speakautocheckbox").checked = data[tabId + "speakautocheckbox"];
      document.getElementById("writeOnSelection").checked = data[tabId + "writeOnSelection"];
    });

    document.getElementById("writeOnSelection").addEventListener("change", function () {
      var isChecked = document.getElementById("writeOnSelection").checked;
      gtcheckboxEnabled = isChecked;

      var newData = {};
      newData[tabId + "writeOnSelection"] = isChecked;
      chrome.storage.local.set(newData);
    });

    // Download text from clipboard
    document.getElementById('downloadClipboard').addEventListener('click', function () {

      chrome.runtime.sendMessage({ downloadClipboardText: "Yes" }, (response) => {
      });


      // chrome.scripting.executeScript({
      //   function: function () {
      //     return navigator.clipboard.readText();
      //   }
      // }, function (result) {
      //   if (result[0] && result[0].result) {
      //     const clipboardText = result[0].result;
      //     const blob = new Blob([clipboardText], { type: 'text/plain' });
      //     const url = URL.createObjectURL(blob);
      //     const a = document.createElement('a');
      //     a.href = url;
      //     a.download = 'clipboard_text.txt';
      //     a.click();
      //     URL.revokeObjectURL(url);
      //   } else {
      //     console.error('Failed to read text from clipboard.');
      //   }
      // });
    });



    document.getElementById("seltxt").addEventListener("change", function () {
      var isChecked = document.getElementById("seltxt").checked;
      gtcheckboxEnabled = isChecked;

      var newData = {};
      newData[tabId + "seltxt"] = isChecked;
      chrome.storage.local.set(newData);
    });


    document.getElementById("spkonseltxt").addEventListener("change", function () {
      var isChecked = document.getElementById("spkonseltxt").checked;
      gtcheckboxEnabled = isChecked;

      var newData = {};
      newData[tabId + "spkonseltxt"] = isChecked;
      chrome.storage.local.set(newData);
    });


    // Save the checkbox value for the current tab when it changes
    document.getElementById("gtcheckbox").addEventListener("change", function () {
      var isChecked = document.getElementById("gtcheckbox").checked;
      gtcheckboxEnabled = isChecked;

      var newData = {};
      newData[tabId + "gtcheckbox"] = isChecked;
      chrome.storage.local.set(newData);
    });



    // Save the checkbox value for the current tab when it changes
    document.getElementById("speakautocheckbox").addEventListener("change", function () {
      var isChecked = document.getElementById("speakautocheckbox").checked;
      var newData = {};
      newData[tabId + "speakautocheckbox"] = isChecked;
      chrome.storage.local.set(newData);
    });

    document.getElementById("srclanguage").addEventListener("change", function () {
      var isChecked = document.getElementById("srclanguage").value;
      var newData = {};
      newData[tabId + "srclanguage"] = isChecked;
      chrome.storage.local.set(newData);
    });

    document.getElementById("tgtlanguage").addEventListener("change", function () {
      var isChecked = document.getElementById("tgtlanguage").value;
      var newData = {};
      newData[tabId + "tgtlanguage"] = isChecked;
      chrome.storage.local.set(newData);
    });

    document.getElementById("speaklanguage").addEventListener("change", function () {
      var isChecked = document.getElementById("speaklanguage").value;
      var newData = {};
      newData[tabId + "speaklanguage"] = isChecked;
      chrome.storage.local.set(newData);
    });


  });

  //   kuroshiro2 = new Kuroshiro();
  //   console.log("kuroshiro2="+kuroshiro2);


  // const analyzer = new KuromojiAnalyzer({ dictPath: "https://indojapcorp.github.io/TechNotes/tts/js/dict" });

  // kuroshiro2.init(analyzer);

  // console.log("kuroshiro init");

  //chrome.runtime.sendMessage({ action: "initKuroshiro" });

});
let lang = "ja";
let utterance = null;

function speakText(text) {

  if (!text) return;
  chrome.runtime.sendMessage({ speak: text }, (response) => {

  });
}

function speakTextTgtText(text) {

  if (!text) return;
  console.log("speakTextTgtText="+text);
  chrome.runtime.sendMessage({ speak: text ,speaklang: "tgtlang"}, (response) => {

  });
}

function stopSpeakText(text) {
  chrome.runtime.sendMessage({ stopspeak: text }, (response) => {
  });
}

async function translate(sourceText, sourceLang, targetLang) {

  //var sourceText = $('textarea#transcript').val();
  //var sourceLang = deflang;
  //var targetLang = $('#trtgtlang').val();
  //var targetLang = 'ja';
  var finalstr = "";
  //console.log(sourceText);

  var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);
  //console.log(url);

  var translatedString;

  translatedString = await getStringFromJSON(url);
  console.log("ddfdf="+translatedString);
  return translatedString;
  // getStringFromJSON(url)
  // .then(result => {
  //   console.log("resultsssdds = "+result);
  //   translatedString=result;
  //   return result;
  // });
  //console.log("translatedString = "+translatedString);

  //return ;
  // fetch(url)
  // .then(res =>res.json())
  // .then(data => {
  //     for (let key in data[0]) {
  //       if (data[0].hasOwnProperty(key)) {
  //         console.log(key + ': ' + data[0][key]);
  //         finalstr += data[0][key];
  //       }
  //     }    
  // })
  // .catch(err => { throw err });


}

function getStringFromJSON(url) {
  // return fetch(url)
  //   .then(response => response.json())
  //   .then(data => {
  //     let result = '';
  //     result += data[0][0] + '\n';
  //     for (let key in data[0]) {
  //       for (let index in key) {
  //         //result += data[0][index] + '\n';
  //       }
  //       //result += data[0][key] + '\n';
  //     }
  //     console.log("inssssxxx="+result);
  //     return result;
  //   })
  //   .catch(error => {
  //     console.log('Error:', error);
  //   });

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      let finalstr = '';
      data[0].forEach(val => {
        finalstr += val[0] + "\n";
      });
      return finalstr;
    })
    .catch(error => {
      console.log('Error:', error);
    });

}
