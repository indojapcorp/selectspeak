// Get the URL of the popup.css file

const cssUrl = chrome.runtime.getURL('styles.css');
document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" type="text/css" href="${cssUrl}">`);

let currentWord = null;

function createDefinitionPopup(selectedWord,definition, showdef) {

  removeDefinitionPopup();
  const popup = document.createElement("div");
  popup.setAttribute("id", "popup");

  popup.classList.add('dictionary-popup');

  if (showdef) {
    //popup.textContent = definition;
    const popupText = document.createElement("div");
    popupText.className = "dictionary-popup-text";
    popupText.textContent = definition;
    popup.appendChild(popupText);
  }else {
    const popupText = document.createElement("div");
    popupText.className = "dictionary-popup-text";
    const s = popupText.style;
    // s.backgroundColor = "azure";
    // s.margin          = "3px";
    // s.borderRadius    = "5px";
    // s.padding         = "2px";
    s.whiteSpace      = 'pre';  // <-- Right here.

console.log("chk="+gtcheckboxEnabled);

// Send a message to the background script requesting the checkbox value
chrome.runtime.sendMessage({ message: "getTranslationValues" }, function(response) {
  if (response && response.chkvalue !== undefined) {
    var isChecked = response.chkvalue;

    console.log("Checkbox value:", isChecked);

    if(isChecked){
      var translatedVal;
      //translate(selectedWord,"en","ja")
      translate(selectedWord,response.srclanguage,response.tgtlanguage)
      .then(result => {
        definition = result; // Assign the result to the global variable
        console.log("translatedVal="+definition); // Log the value of translatedVal
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
    if (showdef){
      speakText(selectedWord+"..."+definition);
    }else{
      speakText("..."+definition);
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

  popup.appendChild(popupButtons);

  return popup;
}


function showDefinitionPopup(selectedWord,definition, x, y, showdef) {
  const popup = createDefinitionPopup(selectedWord,definition, showdef);
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

function handleMouseUp(event) {
  var source = event.target || event.srcElement;
  if (source.id == 'speakButton' || source.id == 'stopSpeakButton' || source.id == 'closeButton') {
    return;
  }

  if (currentWord) {
    removeDefinitionPopup();
    currentWord = null;
  }
  const selection = window.getSelection();
  const selectedWord = selection.toString().trim();
  if (selectedWord) {
    currentWord = selectedWord;
    const x = event.pageX;
    const y = event.pageY;

    if (!containsWhitespace(selectedWord)) {
      chrome.runtime.sendMessage({ word: selectedWord }, (response) => {
        if (response && response.definition) {
          showDefinitionPopup(selectedWord,response.definition, x+5, y+10, true);
        }else if(response){
          showDefinitionPopup(selectedWord,"", x+5, y+10, true);
        }
      });
    } else {
      var coordinates = getSelectionCoordinates();
      showDefinitionPopup(selectedWord,selectedWord, coordinates.x, coordinates.y, false);
    }
  }
}

//document.addEventListener("mouseup", handleMouseUp);

document.addEventListener("mouseup", (event) => {

if (chrome.runtime?.id) {

  chrome.runtime.sendMessage({ slttxtval: "abc" }, (response) => {

    if(response.spkonsel && response.spkonsel=='Yes'){
      const selection = window.getSelection();
      const selectedWord = selection.toString().trim();
      console.log("here2");
      console.log(selectedWord);
      speakText(selectedWord);
    }

    if (response && response.deflang && response.deflang=='Yes') {
      handleMouseUp(event);
    }
  });
}
   
});



document.addEventListener("mousedown", (event) => {
  var source = event.target || event.srcElement;

  if (source.id == 'speakButton' || source.id == 'stopSpeakButton') {
  }
  else if (event.button === 0 && currentWord) {
    if (source.id != 'speakButton' && source.id != 'stopSpeakButton') {
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
var gtcheckboxEnabled=false;
document.addEventListener("DOMContentLoaded", function () {
  
  // if(!win){
  // win = window.open(
  //   "https://indojapcorp.github.io/mediarecorder/", 'popUpWindow1', 'height=250,width=400,left=0,top=0,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=no');
  // win.focus();
  // }


  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tabId = tabs[0].id;
    var spkonseltxtfortabid = tabs[0].id+"spkonseltxt";


    
    chrome.storage.local.get([tabId.toString(),tabId+"speakautocheckbox",tabId+"seltxt",tabId+"spkonseltxt",tabId+"gtcheckbox", tabId + "srclanguage", tabId + "tgtlanguage"], function (data) {
      document.getElementById("seltxt").value = data[tabId] || "No";
      document.getElementById("spkonseltxt").value = data[spkonseltxtfortabid] || "No";
      document.getElementById("srclanguage").value = data[tabs[0].id+"srclanguage"];
      document.getElementById("tgtlanguage").value = data[tabs[0].id+"tgtlanguage"];
      document.getElementById("gtcheckbox").checked = data[tabId+"gtcheckbox"];
      document.getElementById("speakautocheckbox").checked = data[tabId+"speakautocheckbox"];
    });

    // chrome.storage.local.get(tabId.toString(), function (data) {
    //   document.getElementById("seltxt").value = data[tabId] || "No";
    // });
    // chrome.storage.local.get(spkonseltxtfortabid, function (data) {
    //   document.getElementById("spkonseltxt").value = data[spkonseltxtfortabid] || "No";
    // });

    // chrome.storage.local.get(tabs[0].id+"srclanguage", function (data) {
    //   document.getElementById("srclanguage").value = data[tabs[0].id+"srclanguage"];
    // });

    // chrome.storage.local.get(tabs[0].id+"tgtlanguage", function (data) {
    //   document.getElementById("tgtlanguage").value = data[tabs[0].id+"tgtlanguage"];
    // });


    // // Load the stored value of the checkbox for the current tab
    //     chrome.storage.local.get(tabId+"gtcheckbox", function(data) {
    //       document.getElementById("gtcheckbox").checked = data[tabId+"gtcheckbox"];
    //       gtcheckboxEnabled=data[tabId+"gtcheckbox"];
    //     });

    //             // Load the stored value of the checkbox for the current tab
    //             chrome.storage.local.get(tabId+"speakautocheckbox", function(data) {
    //               document.getElementById("speakautocheckbox").checked = data[tabId+"speakautocheckbox"];
    //             });
        
        // Save the checkbox value for the current tab when it changes
        document.getElementById("gtcheckbox").addEventListener("change", function() {
          var isChecked = document.getElementById("gtcheckbox").checked;
          gtcheckboxEnabled=isChecked;

          var newData = {};
          newData[tabId+"gtcheckbox"] = isChecked;
          chrome.storage.local.set(newData);
        });
    

            
                // Save the checkbox value for the current tab when it changes
                document.getElementById("speakautocheckbox").addEventListener("change", function() {
                  var isChecked = document.getElementById("speakautocheckbox").checked;
                  var newData = {};
                  newData[tabId+"speakautocheckbox"] = isChecked;
                  chrome.storage.local.set(newData);
                });
        

  });

  document.getElementById("save").addEventListener("click", function () {
    var seltxt = document.getElementById("seltxt").value;
    var spkonseltxt = document.getElementById("spkonseltxt").value;
    var srclanguageSelect = document.getElementById("srclanguage");
    var tgtlanguageSelect = document.getElementById("tgtlanguage");
    var srclanguage = srclanguageSelect.value;
    var tgtlanguage = tgtlanguageSelect.value;
  
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tabId = tabs[0].id;
      var data = {};
      var spkonseltxtfortabid = tabs[0].id+"spkonseltxt";
      data[tabId] = seltxt;
      data[spkonseltxtfortabid] = spkonseltxt;
      data[tabs[0].id+"srclanguage"] = srclanguage;
      data[tabs[0].id+"tgtlanguage"] = tgtlanguage;

      chrome.storage.local.set(data, function () {
        alert("Changed enabled ext to " + seltxt +" and Speak on Select to "+spkonseltxt);
      });
    });
  });

});

let lang = "ja";
let utterance = null;

function speakText(text) {

  if (!text) return;
  chrome.runtime.sendMessage({ speak: text }, (response) => {

  });
}

function stopSpeakText(text) {
  chrome.runtime.sendMessage({ stopspeak: text }, (response) => {
  });
}

async function translate(sourceText,sourceLang,targetLang) {

  //var sourceText = $('textarea#transcript').val();
  //var sourceLang = deflang;
  //var targetLang = $('#trtgtlang').val();
  //var targetLang = 'ja';
  var finalstr = "";
  console.log(sourceText);

  var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);
  console.log(url);

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
        finalstr += val[0] + "\n" ;
      });
      return finalstr;
    })
    .catch(error => {
      console.log('Error:', error);
    });

}

