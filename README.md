🕒 Tab Tracker
Tab Tracker is a lightweight Chrome extension that tracks how much time you spend on each website per day and summarizes your browsing data over the past 7 days.

Useful for:

Productivity monitoring

Building self-awareness of digital habits

Daily breakdown of domain-wise usage

🚀 Features
Track active tab time per domain.

Summarize usage data for the last 7 days.

Visualize details like date, total time, and domain-wise time.

Option to clear all data in one click.

🧩 How It Works (Behind the Scenes)
This extension uses key Chrome APIs:

🔧 Chrome APIs Used:
chrome.tabs – to get info about the currently active tab and its URL.

chrome.windows – to detect focus changes across browser windows.

chrome.storage.local – to persist time tracking data for each domain/date.

chrome.runtime – to listen to events across the extension.


🧠 Logic:
Every second, the extension checks the active tab and whether the window is focused.

If yes, it increments the timer for the domain being viewed.

Time is stored in chrome.storage.local using a nested structure by date and domain.

The popup reads this data and renders a neat summary of:

Total time per day (last 7 days)

Domain-wise breakdown

🛠️ How to Clone and Run Locally
Clone the Repository
git clone https://github.com/your-username/tab-tracker.git
cd tab-tracker
Open in Chrome

Open Chrome

Visit: chrome://extensions

Enable Developer Mode (top-right)

Click "Load unpacked"

Select the cloned project folder (tab-tracker/)

The extension icon should now appear in your Chrome toolbar.

📁 Project Structure
pgsql
tab-tracker/
├── background.js       # Handles tracking logic
├── popup.html          # UI shown when user clicks the extension icon
├── popup.js            # Renders the 7-day and domain-wise usage
├── icon48.png          # Extension icon
├── manifest.json       # Chrome extension config
└── styles (inline CSS in popup.html)
📌 Notes
Time is only tracked when the tab is active and browser window is in focus.

All data is stored locally in your browser (privacy-friendly).

Click "Clear All Data" in the popup to reset everything.
