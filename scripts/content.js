// Content script for log filtering

let originalContent = null;
let containerElement = null;

// Initialize by finding the content container
function init() {
    // Chrome usually wraps text files in a <pre> tag
    const pre = document.querySelector('pre');
    if (pre) {
        containerElement = pre;
        originalContent = pre.innerText;
    } else {
        // Fallback for plain text or other structures
        containerElement = document.body;
        originalContent = document.body.innerText;
    }
    console.log('Log Viewer: Content initialized. Length:', originalContent.length);
}

const LOG_ENTRY_PATTERN = /^\[(\d+)\] (INFO|WARN|ERROR|DEBUG|TRACE) (\d{2}:\d{2}:\d{2})\s+(.*)$/; // Example: 2024-01-01, 12:00:00, or [INFO]

function parseLogEntries(text) {
    const lines = text.split('\n');
    const entries = [];
    let currentEntry = null;

    for (const line of lines) {
        if (LOG_ENTRY_PATTERN.test(line)) {
            if (currentEntry) {
                entries.push(currentEntry);
            }
            currentEntry = { line: line, extra: '' };
        } else {
            if (currentEntry) {
                currentEntry.extra += (currentEntry.extra ? '\n' : '') + line;
            } else {
                // If the file starts with non-matching lines, treat them as the main line of an entry
                currentEntry = { line: line, extra: '' };
            }
        }
    }
    if (currentEntry) entries.push(currentEntry);
    return entries;
}

// Filter function
function filterContent(lineFilter, keywordFilter) {
    if (!originalContent) init();

    if (!lineFilter && !keywordFilter) {
        // Restore original if filters are empty
        containerElement.innerText = originalContent;
        return;
    }

    // Parse logs into grouped entries
    const logEntries = parseLogEntries(originalContent);

    // Filter entries
    const filteredEntries = logEntries.filter(entry => {
        const matchesLine = !lineFilter || entry.line.includes(lineFilter);

        let matchesKeyword = true;
        if (keywordFilter?.trim()) {
            const raw = keywordFilter
                .split(',')
                .map(k => k.trim())
                .filter(k => k);

            // Separate positive and negative keywords
            const positive = raw
                .filter(k => !k.startsWith('!'))
                .map(k => k.toLowerCase());

            const negative = raw
                .filter(k => k.startsWith('!'))
                .map(k => k.slice(1).toLowerCase());

            const fullEntryText = `${entry.line ?? ""}\n${entry.extra ?? ""}`.toLowerCase();

            // Match ANY positive keyword (OR logic)
            const posOK = positive.length === 0 || positive.some(k => fullEntryText.includes(k));

            // Match NO negative keyword
            const negOK = negative.length === 0 || negative.every(k => !fullEntryText.includes(k));

            matchesKeyword = posOK && negOK;
        }

        return matchesLine && matchesKeyword;
    });

    // Join the full text of matching entries
    containerElement.innerText = filteredEntries.map(e => e.line + (e.extra ? '\n' + e.extra : '')).join('\n');
    console.log(`Log Viewer: Filtered ${logEntries.length} entries to ${filteredEntries.length} entries.`);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "filterLogs") {
        const { lineText, keywords } = message.data;
        console.log('Log Viewer: Received filter request:', { lineText, keywords });
        filterContent(lineText, keywords);
        sendResponse({ status: "filtered", count: 0 });
    }
    return true;
});

// Run init on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
