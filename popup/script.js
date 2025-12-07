document.addEventListener('DOMContentLoaded', () => {
    const applyBtn = document.getElementById('applyBtn');
    const lineTextInput = document.getElementById('threadNumber'); // Keeping ID same for CSS/HTML simplicity, but variable changed
    const keywordsInput = document.getElementById('keywords');
    const statusDiv = document.getElementById('status');

    applyBtn.addEventListener('click', () => {
        const lineText = lineTextInput.value;
        const keywords = keywordsInput.value;

        if (!lineText) {
            statusDiv.style.color = 'var(--error-color, #dc2626)';
            statusDiv.textContent = 'Please fill in Line Text.';
            return;
        }

        console.log('Applying settings:', { lineText, keywords });

        // Send to active tab content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "filterLogs",
                    data: { lineText, keywords }
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error sending message:", chrome.runtime.lastError);
                        statusDiv.style.color = 'var(--error-color, #dc2626)';
                        statusDiv.textContent = 'Error: Refresh page or check "Allow file URLs" in Permissions';
                    } else {
                        console.log("Filter response:", response);
                        statusDiv.style.color = 'var(--primary-color, #059669)';
                        statusDiv.textContent = 'Filter applied!';
                    }
                });
            } else {
                statusDiv.style.color = 'var(--error-color, #dc2626)';
                statusDiv.textContent = 'Error: No active tab found.';
            }
        });

        statusDiv.style.color = 'var(--primary-color, #059669)';
        statusDiv.textContent = 'Applying filter...';
    });

    // Real-time filtering with debounce
    let debounceTimer;
    lineTextInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const lineText = lineTextInput.value;
            const keywords = keywordsInput.value;

            // Auto-apply if there's input or if it's cleared
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "filterLogs",
                        data: { lineText, keywords }
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            // Silent fail on typing, user will see error on Apply
                            console.warn("Real-time filter error:", chrome.runtime.lastError);
                        } else {
                            statusDiv.style.color = 'var(--primary-color, #059669)';
                            statusDiv.textContent = lineText ? 'Filtered.' : 'Showing all.';
                        }
                    });
                }
            });
        }, 300); // 300ms delay
    });
});
