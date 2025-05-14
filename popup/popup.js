// constants
const COMPLETION_URL = 'https://api.openai.com/v1/chat/completions';
const POST_SYSTEM_PROMPT = 'Summarize the following text in a paragraph or less.'
const COMMENTS_SYSTEM_PROMPT = 'Summarize the following forum comments which are separated by a ";" character.'
const MAX_COMMENTS = 100;

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
            chrome.tabs.sendMessage(tabs[0].id, { request: 'comments' }, (comments) => {
                fetch(COMPLETION_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: COMMENTS_SYSTEM_PROMPT
                            },
                            {
                                role: 'user',
                                content: comments.slice(0, MAX_COMMENTS).join(';')
                            }
                        ]
                    })
                }).then((chatRes) => {
                    if (!chatRes.ok) {
                        commentSummary = 'Error generating summary';
                        summaryElem.innerText = commentSummary;
                    } else {
                        chatRes.json().then((chatResJSON) => {
                            commentSummary = chatResJSON.choices[0].message.content;
                            summaryElem.innerText = commentSummary;
                        });
                    }
                });
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
            chrome.tabs.sendMessage(tabs[0].id, { request: 'post' }, (postText) => {
                fetch(COMPLETION_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: POST_SYSTEM_PROMPT
                            },
                            {
                                role: 'user',
                                content: postText
                            }
                        ]
                    })
                }).then((chatRes) => {
                    if (!chatRes.ok) {
                        postSummary = 'Error generating summary';
                        summaryElem.innerText = postSummary;
                    } else {
                        chatRes.json().then((chatResJSON) => {
                            postSummary = chatResJSON.choices[0].message.content;
                            summaryElem.innerText = postSummary;
                        });
                    }
                });
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
    summarizeCommentsBtn.classList.add('active');
    summarizePostBtn.classList.remove('active');

    getCommentSummary(summary);
});
summarizePostBtn.addEventListener('click', () => {
    summarizePostBtn.classList.add('active');
    summarizeCommentsBtn.classList.remove('active');

    getPostSummary(summary);
});
