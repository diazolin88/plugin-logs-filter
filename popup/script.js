document.addEventListener('DOMContentLoaded', () => {
    const applyBtn = document.getElementById('applyBtn');
    const threadInput = document.getElementById('threadNumber');
    const keywordsInput = document.getElementById('keywords');
    const statusDiv = document.getElementById('status');

    applyBtn.addEventListener('click', () => {
        const threadNumber = threadInput.value;
        const keywords = keywordsInput.value;

        if (!threadNumber) {
            statusDiv.style.color = '#dc2626';
            statusDiv.textContent = 'Please fill in Thread ID.';
            return;
        }

        console.log('Applying settings:', { threadNumber, keywords });

        // Send to active tab content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "filterLogs",
                    data: { threadNumber, keywords }
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error sending message:", chrome.runtime.lastError);
                        statusDiv.style.color = '#dc2626';
                        statusDiv.textContent = 'Error: Refresh page or check "Allow file URLs" in Permissions';
                    } else {
                        console.log("Filter response:", response);
                        statusDiv.style.color = '#059669';
                        statusDiv.textContent = 'Filter applied!';
                    }
                });
            } else {
                statusDiv.style.color = '#dc2626';
                statusDiv.textContent = 'Error: No active tab found.';
            }
        });

        statusDiv.style.color = '#059669';
        statusDiv.textContent = 'Applying filter...';
    });

    // Real-time filtering with debounce
    let debounceTimer;
    threadInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const threadNumber = threadInput.value;
            const keywords = keywordsInput.value;

            // Auto-apply if there's input or if it's cleared
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "filterLogs",
                        data: { threadNumber, keywords }
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            // Silent fail on typing, user will see error on Apply
                            console.warn("Real-time filter error:", chrome.runtime.lastError);
                        } else {
                            statusDiv.style.color = '#059669';
                            statusDiv.textContent = threadNumber ? 'Filtered.' : 'Showing all.';
                        }
                    });
                }
            });
        }, 300); // 300ms delay
    });
});
