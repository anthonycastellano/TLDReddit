// constants
const COMPLETION_URL = 'https://api.openai.com/v1/chat/completions';
const POST_SYSTEM_PROMPT = 'Summarize the following text in a paragraph or less.';
const COMMENTS_SYSTEM_PROMPT = 'Summarize the following forum comments which are separated by a ";" character.';
const MAX_COMMENTS = 100;
const REDDIT_HOSTNAME = 'www.reddit.com';

// global vars
let apiKey = '';
let postSummary = '';
let commentSummary = '';

// helper functions
function getCommentSummary(nodes) {
    const { summary, spinner } = nodes;

    // check cached summary
    if (commentSummary) {
        summary.innerText = commentSummary;
        return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
            console.error('No active tab found');
            return;
        }
        spinner.style.opacity = 100;
        summary.innerText = '';
        // send a message requesting comment text
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
                    summary.innerText = commentSummary;
                } else {
                    chatRes.json().then((chatResJSON) => {
                        spinner.style.opacity = 0;
                        commentSummary = chatResJSON.choices[0].message.content;
                        summary.innerText = commentSummary;
                    });
                }
            });
        });
    });
}

function getPostSummary(nodes) {
    const { summary, spinner } = nodes;

    // check cached summary
    if (postSummary) {
        summary.innerText = postSummary;
        return;
    }
    spinner.style.opacity = 100;
    summary.innerText = '';
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
            console.error('No active tab found');
        }
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
                    summary.innerText = postSummary;
                } else {
                    chatRes.json().then((chatResJSON) => {
                        spinner.style.opacity = 0;
                        postSummary = chatResJSON.choices[0].message.content;
                        summary.innerText = postSummary;
                    });
                }
            });
        });
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

// DOM elements
const summary = document.getElementById('summary');
const summarizeCommentsBtn = document.getElementById('summarize-comments-btn');
const summarizePostBtn = document.getElementById('summarize-post-btn');
const spinner = document.getElementById('spinner');

const nodes = {
    summary,
    summarizeCommentsBtn,
    summarizePostBtn,
    spinner
};

// check if on reddit
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) {
        console.error('No active tab found');
        return;
    }
    const url = tabs[0].url;
    if (!url.includes(REDDIT_HOSTNAME)) {
        summarizeCommentsBtn.style.display = 'none';
        summarizePostBtn.style.display = 'none';
        summary.innerText = 'TLDR: This extension only works on Reddit.';
        return;
    }
});

// summarize logic
summarizeCommentsBtn.addEventListener('click', () => {
    summarizeCommentsBtn.classList.add('active');
    summarizePostBtn.classList.remove('active');

    spinner.style.opacity = 100;
    getCommentSummary(nodes)
    spinner.style.opacity = 0;
});
summarizePostBtn.addEventListener('click', () => {
    summarizePostBtn.classList.add('active');
    summarizeCommentsBtn.classList.remove('active');

    getPostSummary(nodes);
});
