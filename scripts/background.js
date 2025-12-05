// Background service worker

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed successfully.');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "popupClicked") {
        console.log("Popup button clicked!");
        sendResponse({ status: "received" });
    }
    return true; // Keep the message channel open for async response
});
