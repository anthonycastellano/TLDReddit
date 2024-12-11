// global vars
let apiKey = '';
let postSummary = '';
let commentSummary = '';

// helper functions
function getCommentSummary(summaryElem) {
    // check cached summary
    if (commentSummary) {
        summaryElem.innerText = commentSummary;
        return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            // Send a message requesting comment text
            chrome.tabs.sendMessage(tabs[0].id, { request: 'comments' }, (res) => {
                commentSummary = res.join('');
                summaryElem.innerText = commentSummary;
            });
        } else {
            console.error('No active tab found');
        }
    });
}

function getPostSummary(summaryElem) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // check cached summary
        if (postSummary) {
            summaryElem.innerText = postSummary;
            return;
        }
        if (tabs[0]) {
            // Send a message requesting post text
            chrome.tabs.sendMessage(tabs[0].id, { request: 'post' }, (res) => {
                postSummary = res;
                summaryElem.innerText = postSummary;
            });
        } else {
            console.error('No active tab found');
        }
    });
}

chrome.storage.local.get(['apiKey']).then((result) => {
    if (result.apiKey) {
        apiKey = result.apiKey;
    } else {
        const mainContainer = document.getElementById('main-container');

        const newInput = document.createElement('input');
        newInput.setAttribute('id', 'apiKeyInput');

        const newButton = document.createElement('button');
        newButton.style.width = '3em';
        newButton.style.height = '1.5em';
        newButton.innerText = 'add';

        const newDiv = document.createElement('div');
        newDiv.appendChild(newInput);
        newDiv.appendChild(newButton);

        newButton.addEventListener('click', () => {
            // store key locally
            chrome.storage.local.set({ apiKey: newInput.value }).then(() => {
                newDiv.remove();
            });
        });

        mainContainer.appendChild(newDiv);
    }
});

// add summarize logic
const summary = document.getElementById('summary');
const summarizeCommentsBtn = document.getElementById('summarize-comments-btn');
const summarizePostBtn = document.getElementById('summarize-post-btn');
summarizeCommentsBtn.addEventListener('click', () => {
    getCommentSummary(summary);
});
summarizePostBtn.addEventListener('click', () => {
    getPostSummary(summary);
});
