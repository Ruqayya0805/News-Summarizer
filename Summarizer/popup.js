document.addEventListener('DOMContentLoaded', function () {
  const summarizeBtn = document.getElementById('summarizeBtn');
  const summaryDiv = document.getElementById('summary');
  const loadingDiv = document.getElementById('loading');

  // Hardcoded Gemini API key (replace with your actual API key)
  const GEMINI_API_KEY = 'AIzaSyDbmGcToR6D9hAagQXrrmxj00fjVSwArt0';

  summarizeBtn.addEventListener('click', async () => {
    summaryDiv.textContent = '';
    loadingDiv.style.display = 'block';

    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab.url.startsWith('http')) {
        chrome.tabs.sendMessage(tab.id, { action: 'extractArticle' }, async (response) => {
          if (chrome.runtime.lastError) {
            console.error('Content script error:', chrome.runtime.lastError.message);
            summaryDiv.textContent = 'Error: Could not connect to content script.';
          } else if (response && response.articleText) {
            try {
              const summary = await getSummaryFromGemini(response.articleText || response);
              summaryDiv.textContent = summary;
            } catch (error) {
              summaryDiv.textContent = `Error: ${error.message}`;
            } finally {
              loadingDiv.style.display = 'none';
            }
          } else {
            summaryDiv.textContent = 'Could not extract article text.';
            loadingDiv.style.display = 'none';
          }
        });
      }
    });
  });

  // Function to get summary from Gemini API
  async function getSummaryFromGemini(text) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Summarize the following news article in 3-4 sentences, capturing the key points:\n\n${text}`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get summary from Gemini');
    }

    const data = await response.json();
    
    // Check if the response contains the expected structure
    if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unexpected response format from Gemini API');
    }
  }
});
