# TLDReddit

A Chrome extension that uses OpenAI's GPT-4 to summarize Reddit posts and their comments.

## Features

- **Post Summarization**: Summarize the original post content in a paragraph or less.
- **Comment Summarization**: Summarize the top comments of a Reddit thread, debounced and deduplicated.
- **Settings**: Configure your OpenAI API key via the extension popup.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle in the top right corner.
3. Click **Load unpacked** and select the root directory of this project.

## Usage

1. Navigate to any subreddit on Reddit (e.g., `www.reddit.com/r/*`).
2. Click the TLDReddit extension icon in your Chrome toolbar.
3. Enter your OpenAI API key in the settings (gear icon).
4. Click **Post** to summarize the original post or **Replies** to summarize the comments.

## Tech Stack

- Manifest V3
- Vanilla JavaScript
- OpenAI API (GPT-4o-mini)

