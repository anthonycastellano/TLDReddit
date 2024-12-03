(async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0]) {
            // Send a message to the content script of the active tab
            chrome.tabs.sendMessage(tabs[0].id, { request: 'comments' }, (res) => {
                console.log(res);
            });
        } else {
            console.error('No active tab found');
        }
    });
})();