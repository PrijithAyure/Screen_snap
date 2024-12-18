document.getElementById('screenshot-btn').addEventListener('click', async () => {
    const status = document.getElementById('status');
    status.textContent = "Taking screenshot...";
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          status.textContent = `Error: ${chrome.runtime.lastError.message}`;
        } else {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = 'screenshot.png';
          link.click();
          status.textContent = "Screenshot saved!";
        }
      });
    } catch (error) {
      status.textContent = `Error: ${error.message}`;
    }
  });
  