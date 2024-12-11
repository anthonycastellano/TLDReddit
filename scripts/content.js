chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.request) {
        case 'comments':
            // get all comment blocks
            // TODO: scroll and sort to get top n comments by upvotes?
            const comments = document.querySelectorAll('[slot="comment"]');
            if (!comments) {
                sendResponse([]);
            }
            const commentTexts = [];
            for (const c of comments) {
                const commentText = c.querySelector('div > div > p').textContent.trim();
                commentTexts.push(commentText);
            }
            sendResponse(commentTexts);
        case 'post':
            // get post text
            const post = document.querySelector('[slot="text-body"]');
            if (!post) {
                sendResponse('');
            }
            sendResponse(post.querySelector('div > div > p').textContent.trim());
    }
});
