const comments = document.querySelectorAll('[slot="comment"]');
const commentTexts = [];
for (const c of comments) {
    const commentText = c.querySelector('div > div > p').textContent;
    commentTexts.push(commentText);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.request === 'comments') {
        // sendResponse(commentTexts);
        sendResponse('test');
    }
});
