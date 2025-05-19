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
                const comment = c.querySelector('div > div > p');
                if (!comment) {
                    continue;
                }
                const commentText = comment.textContent.trim();
                commentTexts.push(commentText);
            }
            sendResponse(commentTexts);
        case 'post':
            // get post text
            const postTitle = document.querySelector('[slot="title"]');
            const postBody = document.querySelector('[slot="text-body"]');

            let postText = postTitle ? postTitle.textContent : '';
            if (postBody) {
                postText += '\n' + postBody.querySelector('div > div > p').textContent.trim();
            }

            sendResponse(postText);
    }
});
