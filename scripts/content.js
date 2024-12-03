const comments = document.querySelectorAll('[slot="comment"]');
for (const c of comments) {
    const commentText = c.querySelector('div > div > p').textContent;
    console.log(commentText);
}