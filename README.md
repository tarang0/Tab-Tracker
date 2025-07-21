# Tab Tracker

**Tab Tracker** is a lightweight Chrome extension that tracks how much time you spend on each website per day and summarizes your browsing data over the past 7 days.

Useful for:
- Productivity monitoring
- Building self-awareness of digital habits
- Daily breakdown of domain-wise usage

---

## Features

- Track **active tab time** per domain.
- Summarize usage data for the **last 7 days**.
- Visualize details like date, total time, and domain-wise time.
- Option to **clear all data** in one click.

---

## Chrome APIs Used

This extension uses the following Chrome APIs:

- `chrome.tabs` – Get the active tab and its URL.
- `chrome.windows` – Detect when the browser window is focused or not.
- `chrome.storage.local` – Store daily time data by domain.
- `chrome.runtime` – Communicate between background and popup scripts.

---

## How It Works

- Every second, a background script checks:
  - Is the browser focused?
  - What tab is currently active?
- If valid, it increases the timer for the active domain for the current date.
- Data is stored in `chrome.storage.local`

---
## How to Clone and Run Locally

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/tab-tracker.git
   cd tab-tracker

2. **Open in Chrome**
- Open Google Chrome
- Turn on Developer Mode
- Click "Load Unpacked" and select the folder
