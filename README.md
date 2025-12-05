# Log Viewer Filter Extension

A Chrome extension to filter raw log files (or text files) directly in the browser. It parses multi-line log entries and allows filtering by Thread ID and Keywords.

## Features

-   **Multi-line Parsing**: Automatically groups log lines into entries (detects timestamps/headers).
-   **Thread ID Filtering**: Filters logs based on the Thread ID found in the header line.
-   **Keyword Filtering**:
    -   **Comma-separated**: Search for multiple terms (e.g., `error, db, timeout`).
    -   **OR Logic**: Matches entries containing *at least one* of the positive keywords.
    -   **Exclusion**: Prefix a keyword with `!` to exclude it (e.g., `!debug`).
    -   **Search Scope**: Searches the entire log entry (header + details/stack trace).
-   **Preserves Context**: Displays the full multi-line entry if a match is found

## Usage

1.  Open a text file or log file in Chrome.
2.  Click the extension icon (the cat!).
3.  **Thread ID**: Enter the specific thread identifier (e.g., `[Thread-12]`).
4.  **Keywords**: Enter terms separated by commas.
    -   Example: `error, exception` (Shows logs with "error" OR "exception").
    -   Example: `error, !db` (Shows logs with "error" BUT NOT "db").
5.  Click **Apply** (or just type, it allows real-time filtering).

## Installation

1.  Clone or download this repository.
2.  Open Chrome and go to `chrome://extensions/`.
3.  Enable **Developer mode** (top right).
4.  Click **Load unpacked**.
5.  Select the folder containing `manifest.json`.
