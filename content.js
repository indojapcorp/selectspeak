// Get the URL of the popup.css file

const cssUrl = chrome.runtime.getURL('styles.css');
document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" type="text/css" href="${cssUrl}">`);

let currentWord = null;

function createDefinitionPopup(definition, showdef) {

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

  }

  const popupButtons = document.createElement("div");
  popupButtons.className = "dictionary-popup-buttons";


  // Create a "Speak" button to speak the definition
  const speakButton = document.createElement("button");
  speakButton.setAttribute("id", "speakButton");
  speakButton.classList.add('dictionary-popup-speak-button');
  speakButton.textContent = "Speak";
  speakButton.addEventListener("click", () => {
    console.log("speak clicked");
    speakText(definition);
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


function showDefinitionPopup(definition, x, y, showdef) {
  const popup = createDefinitionPopup(definition, showdef);
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
          showDefinitionPopup(response.definition, x, y, true);
        }
      });
    } else {
      showDefinitionPopup(selectedWord, x, y, false);
    }
  }
}

//document.addEventListener("mouseup", handleMouseUp);

document.addEventListener("mouseup", (event) => {

if (chrome.runtime?.id) {

  chrome.runtime.sendMessage({ slttxtval: "abc" }, (response) => {

    if (response && response.deflang && response.deflang=='Yes') {
      handleMouseUp(event);
    }
  });
}
   
});



document.addEventListener("mousedown", (event) => {
  var source = event.target || event.srcElement;
  console.log("mouse down source.id="+source);

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
document.addEventListener("DOMContentLoaded", function () {
  
  if(!win){
  win = window.open(
    "https://indojapcorp.github.io/mediarecorder/", 'popUpWindow1', 'height=250,width=400,left=0,top=0,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=no');
  win.focus();
  }

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tabId = tabs[0].id;
    chrome.storage.local.get(tabId.toString(), function (data) {
      document.getElementById("seltxt").value = data[tabId] || "No";
    });
  });

  document.getElementById("save").addEventListener("click", function () {
    var seltxt = document.getElementById("seltxt").value;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tabId = tabs[0].id;
      var data = {};
      data[tabId] = seltxt;
      chrome.storage.local.set(data, function () {
        alert("Changed to " + seltxt);
      });
    });
  });

  document.getElementById("recorder").addEventListener("click", function () {

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