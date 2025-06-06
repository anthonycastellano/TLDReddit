// constants
const COMPLETION_URL = 'https://api.openai.com/v1/chat/completions';
const COMMENT_DELIM = '|';
const POST_SYSTEM_PROMPT = 'Summarize the following text in a paragraph or less.';
const COMMENTS_SYSTEM_PROMPT = `Summarize the following forum comments which are delimted by the '${COMMENT_DELIM}' character.`;
const MAX_COMMENT_CHARS = 50_000;
const REDDIT_HOSTNAME = 'www.reddit.com';

// global vars
let apiKey = '';
let postSummary = '';
let commentSummary = '';
let settingsOpen = false;

// DOM elements
const summary = document.getElementById('summary');
const summarizeCommentsBtn = document.getElementById('summarize-comments-btn');
const summarizePostBtn = document.getElementById('summarize-post-btn');
const spinner = document.getElementById('spinner');
const settingsIcon = document.getElementById('settings-icon');
const mainElem = document.getElementById('main-container');
const settingsElem = document.getElementById('settings-container');
const apiKeyInput = document.getElementById('api-key');
const settingsSubmitBtn = document.getElementById('api-key-sub-btn');
const modelProviderDropdown = document.getElementById('model-provider');

const nodes = {
    summary,
    summarizeCommentsBtn,
    summarizePostBtn,
    spinner,
    settingsIcon,
    mainElem,
    settingsElem,
    apiKeyInput,
    settingsSubmitBtn,
    modelProviderDropdown,
};

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
            if (!comments) {
                commentSummary = 'No comments found';
                summary.innerText = commentSummary;
                spinner.style.opacity = 0;
                return;
            }
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
                            content: comments.join(COMMENT_DELIM).substring(0, MAX_COMMENT_CHARS)
                        }
                    ]
                })
            }).then((chatRes) => {
                if (!chatRes.ok) {
                    commentSummary = 'Error generating summary';
                    summary.innerText = commentSummary;
                    spinner.style.opacity = 0;
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
            if (!postText) {
                postSummary = 'No comments found';
                summary.innerText = postSummary;
                spinner.style.opacity = 0;
                return;
            }
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
                    spinner.style.opacity = 0;
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

function showSettings(nodes) {
    const { mainElem, settingsElem, apiKeyInput, settingsSubmitBtn, modelProviderDropdown } = nodes;
    mainElem.style.display = 'none';
    settingsElem.style.display = 'flex';
    apiKeyInput.value = '';

    // if apiKey is set, disable the input field for API key
    if (apiKey) {
        apiKeyInput.disabled = true;
        apiKeyInput.placeholder = 'API key already set';

        modelProviderDropdown.disabled = true;

        settingsSubmitBtn.value = 'Clear';
        settingsSubmitBtn.style.backgroundColor = '#ff0000';
    } else {
        apiKeyInput.disabled = false;
        apiKeyInput.placeholder = 'Enter your API key';

        modelProviderDropdown.disabled = false;

        settingsSubmitBtn.value = 'Save';
        settingsSubmitBtn.style.backgroundColor = '#00ff00';
    }
}

function hideSettings(nodes) {
    const { mainElem, settingsElem } = nodes;
    mainElem.style.display = 'flex';
    settingsElem.style.display = 'none';
}

function toggleSettings() {
    if (settingsOpen) {
        hideSettings(nodes);
        settingsOpen = false;
    } else {
        showSettings(nodes);
        settingsOpen = true;
    }
}

// check for existing API key
chrome.storage.local.get(['apiKey']).then((result) => {
    if (result.apiKey) {
        apiKey = result.apiKey;
    } else {
        // hide main page and display settings page
        toggleSettings();
    }
});


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

// settings icon handler
settingsIcon.addEventListener('click', () => {
    toggleSettings();
});

// settings submit handler
settingsSubmitBtn.addEventListener('click', () => {
    if (apiKey) {
        // remove key from local storage
        chrome.storage.local.remove('apiKey');
        apiKey = '';

        // update UI
        showSettings(nodes);
    } else {
        // store key locally
        chrome.storage.local.set({ apiKey: apiKeyInput.value }).then(() => {
            toggleSettings();
            apiKey = apiKeyInput.value;
        });
    }
});