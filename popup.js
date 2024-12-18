document.getElementById('screenshot-btn').addEventListener('click', async () => {
    const status = document.getElementById('status');
    status.textContent = "Capturing full page...";
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
      // Get page dimensions
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          return {
            width: document.documentElement.scrollWidth,
            height: document.documentElement.scrollHeight,
            viewportHeight: window.innerHeight,
          };
        },
      });
  
      const { width, height, viewportHeight } = result[0].result;
  
      // Scroll and capture screenshots
      let screenshots = [];
      for (let scrollY = 0; scrollY < height; scrollY += viewportHeight) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (scroll) => window.scrollTo(0, scroll),
          args: [scrollY],
        });
  
        const screenshot = await new Promise((resolve) =>
          chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, resolve)
        );
  
        screenshots.push(screenshot);
      }
  
      // Combine screenshots
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
  
      let yOffset = 0;
      for (const screenshot of screenshots) {
        const img = new Image();
        img.src = screenshot;
        await new Promise((resolve) => (img.onload = resolve));
        ctx.drawImage(img, 0, yOffset);
        yOffset += viewportHeight;
      }
  
      // Save the combined image
      const dataUrl = canvas.toDataURL();
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'fullpage-screenshot.png';
      link.click();
  
      status.textContent = "Full page screenshot saved!";
    } catch (error) {
      status.textContent = `Error: ${error.message}`;
    }
  });
  