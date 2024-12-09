const API_KEY_KEY = 'apiKey';

let apiKey = '';
chrome.storage.local.get([API_KEY_KEY]).then((result) => {
    if (result.apiKey) {
        apiKey = result.apiKey;
    } else {
        const mainContainer = document.getElementById('main-container');
        
        const newInput = document.createElement('input');
        newInput.setAttribute('id', 'apiKeyInput');

        const newButton = document.createElement('button');
        newButton.addEventListener('click', () => {
            const apiKeyInput = document.getElementById('apiKeyInput');
            console.log(apiKeyInput.value);
        });
        newButton.style.width = '3em';
        newButton.style.height = '1.5em';
        newButton.innerText = 'add';

        const newDiv = document.createElement('div');
        newDiv.appendChild(newInput);
        newDiv.appendChild(newButton);
        mainContainer.appendChild(newDiv);
    }
});
  

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
        // Send a message to the content script of the active tab
        chrome.tabs.sendMessage(tabs[0].id, { request: 'comments' }, (res) => {
            console.log(res);
        });
    } else {
        console.error('No active tab found');
    }
});