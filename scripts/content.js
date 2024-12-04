chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.request === 'comments') {
        const comments = document.querySelectorAll('[slot="comment"]');
        const commentTexts = [];
        for (const c of comments) {
            const commentText = c.querySelector('div > div > p').textContent.trim();
            commentTexts.push(commentText);
        }
        sendResponse(commentTexts);
    }
});
